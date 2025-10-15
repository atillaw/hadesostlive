import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Kick VOD scraping...");

    // Fetch the Kick channel page
    const kickResponse = await fetch("https://kick.com/hadesost");
    const html = await kickResponse.text();

    console.log("Fetched Kick page, parsing VODs...");

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse VODs from the HTML
    // Note: Kick's structure may vary, this is a basic approach
    const vods = [];
    
    // Try to find VOD data in the page's JSON data
    const jsonMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
    if (jsonMatch) {
      try {
        const pageData = JSON.parse(jsonMatch[1]);
        console.log("Found page data");
        
        // Navigate through the data structure to find VODs
        // This structure may need adjustment based on actual Kick page structure
        const props = pageData?.props?.pageProps;
        
        if (props?.videos) {
          for (const video of props.videos) {
            vods.push({
              title: video.title || "Untitled VOD",
              thumbnail_url: video.thumbnail || null,
              video_url: `https://kick.com/hadesost?video=${video.id}`,
            });
          }
        }
      } catch (e) {
        console.error("Error parsing page data:", e);
      }
    }

    // Fallback: Try to parse from HTML structure
    if (vods.length === 0) {
      console.log("Using fallback HTML parsing...");
      
      // Look for video cards in the HTML
      const videoMatches = html.matchAll(/data-video-id="([^"]+)"/g);
      let count = 0;
      
      for (const match of videoMatches) {
        if (count >= 10) break; // Limit to 10 VODs
        
        const videoId = match[1];
        vods.push({
          title: `Stream VOD #${videoId}`,
          thumbnail_url: `https://images.kick.com/video_thumbnails/${videoId}/thumb.jpg`,
          video_url: `https://kick.com/hadesost?video=${videoId}`,
        });
        count++;
      }
    }

    console.log(`Found ${vods.length} VODs`);

    // Insert or update VODs in database
    let inserted = 0;
    for (const vod of vods) {
      // Check if VOD already exists by URL
      const { data: existing } = await supabase
        .from("vods")
        .select("id")
        .eq("video_url", vod.video_url)
        .single();

      if (!existing) {
        const { error } = await supabase.from("vods").insert(vod);
        if (!error) {
          inserted++;
        } else {
          console.error("Error inserting VOD:", error);
        }
      }
    }

    console.log(`Inserted ${inserted} new VODs`);

    return new Response(
      JSON.stringify({
        success: true,
        totalFound: vods.length,
        newVods: inserted,
        message: `Scraped ${vods.length} VODs, added ${inserted} new ones`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in scrape-kick-vods function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
