import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Kick API endpoints
const KICK_API_BASE = "https://kick.com/api/v2";

interface KickUserData {
  id: number;
  username: string;
  slug: string;
  profile_pic: string | null;
  bio: string | null;
  following_count: number;
  follower_count: number;
  is_banned: boolean;
  playback_url: string | null;
  subscription_enabled: boolean;
}

interface KickChannelSubscriber {
  id: number;
  username: string;
  subscribed_for: number; // months
  badges: any[];
  is_gifter: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRole);

    // Get the user's kick account
    const { data: kickAccount, error: accountError } = await supabaseAdmin
      .from("kick_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (accountError || !kickAccount) {
      return new Response(JSON.stringify({ error: "Kick account not connected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Syncing stats for user:", kickAccount.kick_username);

    // Fetch user data from Kick API using the access token
    let kickUserData = null;
    let channelData = null;

    try {
      // Get user profile from Kick
      const userResponse = await fetch(`${KICK_API_BASE}/user`, {
        headers: {
          "Authorization": `Bearer ${kickAccount.access_token}`,
          "Accept": "application/json",
        },
      });
      
      if (userResponse.ok) {
        kickUserData = await userResponse.json();
        console.log("Fetched Kick user data:", kickUserData?.username);
      }

      // Get channel data for hadesost
      const channelResponse = await fetch(`${KICK_API_BASE}/channels/hadesost`, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (channelResponse.ok) {
        channelData = await channelResponse.json();
        console.log("Fetched channel data");
      }
    } catch (apiError) {
      console.error("Kick API error:", apiError);
    }

    // Calculate stats based on available data
    const now = new Date();
    const followedAt = kickAccount.followed_at ? new Date(kickAccount.followed_at) : null;
    const subscribedAt = kickAccount.subscribed_at ? new Date(kickAccount.subscribed_at) : null;

    // Calculate follow months
    let followMonths = 0;
    if (followedAt) {
      followMonths = Math.floor((now.getTime() - followedAt.getTime()) / (1000 * 60 * 60 * 24 * 30));
    }

    // Calculate subscription months
    let subscriptionMonths = kickAccount.subscription_months || 0;
    if (subscribedAt && !subscriptionMonths) {
      subscriptionMonths = Math.floor((now.getTime() - subscribedAt.getTime()) / (1000 * 60 * 60 * 24 * 30));
    }

    // Get existing stats
    const { data: existingStats } = await supabaseAdmin
      .from("kick_user_stats")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Build monthly activity history
    const monthlyActivity = existingStats?.monthly_activity || [];
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    // Update or add current month
    const monthIndex = monthlyActivity.findIndex((m: any) => m.month === currentMonth);
    if (monthIndex >= 0) {
      monthlyActivity[monthIndex].activity_count = (monthlyActivity[monthIndex].activity_count || 0) + 1;
      monthlyActivity[monthIndex].last_active = now.toISOString();
    } else {
      monthlyActivity.push({
        month: currentMonth,
        activity_count: 1,
        messages: existingStats?.messages_this_month || 0,
        watch_time_minutes: existingStats?.watch_time_this_month || 0,
        last_active: now.toISOString(),
      });
      // Keep only last 12 months
      if (monthlyActivity.length > 12) {
        monthlyActivity.shift();
      }
    }

    // Prepare stats data
    const statsData = {
      user_id: user.id,
      kick_user_id: kickAccount.kick_user_id,
      kick_username: kickAccount.kick_username,
      subscription_start_date: subscribedAt?.toISOString() || null,
      subscription_months: subscriptionMonths,
      subscription_streak: existingStats?.subscription_streak || (kickAccount.is_subscriber ? 1 : 0),
      renewal_cycle: kickAccount.subscription_tier === "gifted" ? "gifted" : "monthly",
      followed_at: followedAt?.toISOString() || null,
      follow_months: followMonths,
      total_messages: existingStats?.total_messages || 0,
      messages_this_month: existingStats?.messages_this_month || 0,
      most_active_hour: existingStats?.most_active_hour,
      most_active_day: existingStats?.most_active_day,
      total_watch_time_minutes: existingStats?.total_watch_time_minutes || 0,
      watch_time_this_month: existingStats?.watch_time_this_month || 0,
      last_seen_at: now.toISOString(),
      loyalty_points: existingStats?.loyalty_points || 0,
      channel_points: existingStats?.channel_points || 0,
      total_donations: existingStats?.total_donations || 0,
      donation_count: existingStats?.donation_count || 0,
      badges: kickAccount.badges || [],
      special_badges: existingStats?.special_badges || [],
      monthly_activity: monthlyActivity,
      last_synced_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    // Upsert stats
    const { data: updatedStats, error: upsertError } = await supabaseAdmin
      .from("kick_user_stats")
      .upsert(statsData, {
        onConflict: "user_id,kick_user_id",
      })
      .select()
      .single();

    if (upsertError) {
      console.error("Error upserting stats:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to sync stats" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update kick_accounts last_synced_at
    await supabaseAdmin
      .from("kick_accounts")
      .update({ last_synced_at: now.toISOString() })
      .eq("user_id", user.id);

    console.log("Stats synced successfully for:", kickAccount.kick_username);

    return new Response(
      JSON.stringify({ 
        success: true, 
        stats: updatedStats,
        message: "Stats synced successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Sync stats error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
