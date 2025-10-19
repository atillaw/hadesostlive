import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUuids } = await req.json();
    
    if (!videoUuids || !Array.isArray(videoUuids)) {
      throw new Error('videoUuids array is required');
    }

    const vodData = [];

    for (const uuid of videoUuids) {
      try {
        const response = await fetch(`https://kick.com/api/v2/videos/${uuid}`);
        
        if (!response.ok) {
          console.error(`Failed to fetch VOD ${uuid}:`, response.status);
          continue;
        }

        const data = await response.json();
        
        vodData.push({
          uuid,
          title: data.session_title || data.livestream?.session_title || `VOD ${uuid}`,
          thumbnail: data.thumbnail?.url || data.livestream?.thumbnail?.url || null,
          video_url: `https://kick.com/hadesost/videos/${uuid}`,
        });
      } catch (error) {
        console.error(`Error fetching VOD ${uuid}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, vods: vodData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
