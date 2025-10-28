import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KICK_CHANNEL = "hadesost";
const KICK_API_URL = `https://kick.com/api/v2/channels/${KICK_CHANNEL}/videos`;
const MIN_DURATION = 3600; // 1 hour in seconds (60 minutes)
const MAX_VODS = 10; // Increased to get more VODs

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
    
    // Fetch VODs from Kick API with retry logic
    let response;
    let retries = 3;
    
    while (retries > 0) {
      try {
        response = await fetch(KICK_API_URL, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) break;
        
        console.log(`Kick API returned ${response.status}, retrying...`);
        retries--;
        if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Fetch error: ${error}, retries left: ${retries}`);
        retries--;
        if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`Kick API error: ${response?.status || 'Network error'}`);
    }

    const apiData = await response.json();
    console.log(`Raw API response type: ${typeof apiData}`, apiData);
    
    // Handle different response formats
    let videos = [];
    if (Array.isArray(apiData)) {
      videos = apiData;
    } else if (apiData.data && Array.isArray(apiData.data)) {
      videos = apiData.data;
    } else if (apiData.videos && Array.isArray(apiData.videos)) {
      videos = apiData.videos;
    } else {
      console.error('Unexpected API response format:', apiData);
      throw new Error("Invalid API response format");
    }
    
    console.log(`Fetched ${videos.length} total videos`);

    // Filter VODs longer than 1 hour
    const longVods = videos.filter((video: any) => {
      const duration = parseInt(video.duration) || 0;
      const durationMinutes = Math.floor(duration / 60);
      console.log(`Video: ${video.session_title || video.title}, Duration: ${durationMinutes} minutes`);
      return duration >= MIN_DURATION;
    });

    console.log(`Found ${longVods.length} VODs longer than 1 hour`);

    // Sort by created_at descending and take top MAX_VODS
    const topVods = longVods
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || a.created).getTime();
        const dateB = new Date(b.created_at || b.created).getTime();
        return dateB - dateA;
      })
      .slice(0, MAX_VODS);

    console.log(`Processing top ${topVods.length} VODs`);

    const processedVods = [];

    for (const video of topVods) {
      // Extract thumbnail URL
      let thumbnailUrl = null;
      if (video.thumbnail?.url) {
        thumbnailUrl = video.thumbnail.url;
      } else if (typeof video.thumbnail === 'string') {
        thumbnailUrl = video.thumbnail;
      } else if (video.thumbnail_url) {
        thumbnailUrl = video.thumbnail_url;
      }
      
      const vod = {
        title: video.session_title || video.title || "Untitled Stream",
        thumbnail_url: thumbnailUrl,
        video_url: `https://kick.com/${KICK_CHANNEL}/videos/${video.uuid || video.id}`,
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
        const { error: insertError } = await supabaseAdmin.from("vods").insert(vod);
        if (insertError) {
          console.error(`Error inserting VOD: ${insertError.message}`);
        }
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
