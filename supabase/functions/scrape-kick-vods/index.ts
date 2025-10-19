import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KICK_API_URL = "https://kick.com/api/v1/channels/hadesost/videos";
const MIN_DURATION = 3600; // 1 hour in seconds
const MAX_VODS = 3;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Yetkilendirme gerekli" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Geçersiz kimlik doğrulama" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user has admin role
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      return new Response(JSON.stringify({ error: "Admin yetkisi gerekli" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Fetching VODs from: ${KICK_API_URL}`);
    
    // Fetch VODs from Kick API
    const response = await fetch(KICK_API_URL);
    if (!response.ok) {
      throw new Error(`Kick API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data?.length || 0} total videos`);

    if (!Array.isArray(data)) {
      throw new Error("Invalid API response format");
    }

    // Filter VODs longer than 1 hour
    const longVods = data.filter((video: any) => {
      const duration = parseInt(video.duration) || 0;
      return duration >= MIN_DURATION;
    });

    console.log(`Found ${longVods.length} VODs longer than 1 hour`);

    // Sort by created_at descending and take top 3
    const topVods = longVods
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      })
      .slice(0, MAX_VODS);

    console.log(`Processing top ${topVods.length} VODs`);

    const processedVods = [];

    for (const video of topVods) {
      const vod = {
        title: video.session_title || video.title || "Untitled Stream",
        thumbnail_url: video.thumbnail?.url || video.thumbnail || null,
        video_url: `https://kick.com/hadesost/videos/${video.uuid || video.id}`,
      };

      processedVods.push(vod);

      // Check if VOD already exists
      const { data: existing } = await supabaseAdmin
        .from("vods")
        .select("id")
        .eq("video_url", vod.video_url)
        .maybeSingle();

      if (!existing) {
        console.log(`Inserting new VOD: ${vod.title}`);
        await supabaseAdmin.from("vods").insert(vod);
      } else {
        console.log(`VOD already exists: ${vod.title}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: processedVods.length,
        vods: processedVods,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("[Server Error] VOD scrape:", err);
    return new Response(JSON.stringify({ error: "VOD tarama başarısız oldu", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
