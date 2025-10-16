import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const videoUrls = [
  "https://kick.com/hadesost/videos/8cd5472b-8ef9-4dfe-bcce-5a68514c0527",
  "https://kick.com/hadesost/videos/e123af50-93d6-4551-94db-023993d1afdc",
  "https://kick.com/hadesost/videos/2905bf2b-fa89-4428-8196-6135874e2ae9",
  "https://kick.com/hadesost/videos/f34708e5-2e6c-48d1-b593-34ab91cd1332",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const vods = [];

    for (const url of videoUrls) {
      console.log(`Fetching: ${url}`);
      const res = await fetch(url);
      const html = await res.text();

      const jsonMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
      if (!jsonMatch) {
        console.warn("Next data JSON bulunamadı:", url);
        continue;
      }

      const json = JSON.parse(jsonMatch[1]);
      const videoData =
        json?.props?.pageProps?.video || json?.props?.pageProps?.videos?.[0];

      if (!videoData) {
        console.warn("Video verisi yok:", url);
        continue;
      }

      const vod = {
        title: videoData?.title || "Untitled Stream",
        thumbnail_url: videoData?.thumbnail?.url || videoData?.thumbnail || null,
        video_url: url,
      };

      console.log("Found VOD:", vod);
      vods.push(vod);

      // Supabase'e kaydet
      const { data: existing } = await supabase
        .from("vods")
        .select("id")
        .eq("video_url", vod.video_url)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("vods").insert(vod);
        if (error) console.error("Insert error:", error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: vods.length,
        vods,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
