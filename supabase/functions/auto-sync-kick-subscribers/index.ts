import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KickChannelResponse {
  followers_count: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting automatic Kick subscriber sync...");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch channel info from Kick API
    const channelResponse = await fetch("https://kick.com/api/v2/channels/hadesost");
    
    if (!channelResponse.ok) {
      console.error("Failed to fetch Kick channel info:", channelResponse.status);
      return new Response(
        JSON.stringify({ error: "Failed to fetch channel info" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const channelData = await channelResponse.json();
    console.log("Channel data fetched, followers:", channelData.followers_count);

    // Get all profiles with connected Kick usernames
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, kick_username, kick_connected_at")
      .not("kick_username", "is", null);

    if (profilesError) {
      console.error("Failed to fetch profiles:", profilesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch profiles" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${profiles?.length || 0} profiles with Kick usernames`);

    // Update subscriber info for each connected user
    let updatedCount = 0;
    let newSubsCount = 0;

    for (const profile of profiles || []) {
      try {
        // Check if user exists in kick_subscribers
        const { data: existingSub } = await supabaseAdmin
          .from("kick_subscribers")
          .select("*")
          .eq("username", profile.kick_username)
          .order("subscribed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingSub) {
          console.log(`Subscriber ${profile.kick_username} already exists`);
          updatedCount++;
        } else {
          // This is a new connection, add them as a basic follower
          const { error: insertError } = await supabaseAdmin
            .from("kick_subscribers")
            .insert({
              username: profile.kick_username,
              subscription_tier: "Follower",
              subscription_type: "follow",
              subscribed_at: profile.kick_connected_at || new Date().toISOString(),
              follower_since: profile.kick_connected_at || new Date().toISOString(),
            });

          if (insertError) {
            console.error(`Failed to add ${profile.kick_username}:`, insertError);
          } else {
            console.log(`Added new follower: ${profile.kick_username}`);
            newSubsCount++;
          }
        }
      } catch (err) {
        console.error(`Error processing ${profile.kick_username}:`, err);
      }
    }

    const result = {
      success: true,
      message: "Sync completed",
      stats: {
        totalProfiles: profiles?.length || 0,
        existingSubscribers: updatedCount,
        newSubscribers: newSubsCount,
        channelFollowers: channelData.followers_count,
      },
    };

    console.log("Sync completed:", result);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("Sync error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to sync subscribers" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
