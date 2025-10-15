import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("Fetching Kick VODs...");
    const res = await fetch("https://kick.com/hadesost/videos");
    const html = await res.text();

    const match = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
    if (!match) throw new Error("No __NEXT_DATA__ found on page");

    const data = JSON.parse(match[1]);
    const allVideos = data?.props?.pageProps?.videos || [];
    const vods = [];

    for (const video of allVideos) {
      // Kick klipleri genellikle birkaç dakika sürer — süre saniye cinsinden
      const duration = video?.duration || 0;
      if (duration < 1800) continue; // sadece 30 dakikadan uzun yayınlar

      // Eğer playback linki varsa alalım
      const sourceUrl = video?.source || null;

      vods.push({
        title: video?.title || "Untitled Stream",
        thumbnail_url: video?.thumbnail?.url || null,
        video_url: sourceUrl || `https://kick.com/video/${video?.id}`,
        duration_seconds: duration,
      });
    }

    console.log(`Found ${vods.length} long VODs`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let inserted = 0;
    for (const vod of vods) {
      const { data: exists } = await supabase
        .from("vods")
        .select("id")
        .eq("video_url", vod.video_url)
        .maybeSingle();

      if (!exists) {
        const { error } = await supabase.from("vods").insert(vod);
        if (!error) inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalFound: vods.length,
        newVods: inserted,
        message: `Scraped ${vods.length} long VODs, inserted ${inserted}`,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
