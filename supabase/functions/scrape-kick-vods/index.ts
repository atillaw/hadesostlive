import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching Kick VOD list...");
    const kickResponse = await fetch("https://kick.com/hadesost/videos");
    const html = await kickResponse.text();

    const jsonMatch = html.match(
      /<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/
    );

    const vods = [];

    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      const videos = data?.props?.pageProps?.videos || [];

      for (const v of videos) {
        vods.push({
          title: v?.slug || v?.title || "Untitled VOD",
          thumbnail_url: v?.thumbnail?.url || null,
          video_url: `https://kick.com/video/${v?.id}`,
        });
      }
    } else {
      console.warn("No JSON found in Kick HTML.");
    }

    console.log(`Found ${vods.length} VODs`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
        message: `Scraped ${vods.length} VODs, inserted ${inserted}`,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error scraping Kick:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
