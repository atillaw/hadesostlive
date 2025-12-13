import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HADESOST_CHANNEL_SLUG = "hadesost";

// ============================================
// KICK API SERVICE - Reusable API calls
// ============================================

interface KickChannelRelationship {
  is_following: boolean;
  followed_at?: string;
  is_subscribed: boolean;
  subscription_tier?: string;
  subscription_months?: number;
  subscribed_at?: string;
  is_moderator: boolean;
  is_vip: boolean;
  is_og: boolean;
  is_founder: boolean;
  badges: any[];
}

async function refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: string } | null> {
  console.log("[TOKEN] Refreshing access token...");
  
  try {
    const response = await fetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.log("[TOKEN] Refresh failed:", response.status);
      return null;
    }

    const data = await response.json();
    const expiresIn = data.expires_in || 3600;
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  } catch (err) {
    console.error("[TOKEN] Refresh error:", err);
    return null;
  }
}

async function fetchChannelRelationship(accessToken: string, channelSlug: string): Promise<KickChannelRelationship> {
  console.log(`[KICK_API] Fetching channel relationship for ${channelSlug}...`);
  
  const defaultRelationship: KickChannelRelationship = {
    is_following: false,
    is_subscribed: false,
    is_moderator: false,
    is_vip: false,
    is_og: false,
    is_founder: false,
    badges: [],
  };

  try {
    const response = await fetch(`https://kick.com/api/v2/channels/${channelSlug}/me`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("[KICK_API] Channel /me response:", JSON.stringify(data).substring(0, 500));

      const subscription = data.subscription || data.subscriber || {};
      const isSubscribed = !!(subscription.id || data.is_subscribed || data.is_subscriber);
      const badges = data.badges || data.chat_identity?.badges || [];
      const badgeTypes = badges.map((b: any) => b.type?.toLowerCase() || b.badge_type?.toLowerCase() || "");

      return {
        is_following: !!data.is_following || !!data.followed_at,
        followed_at: data.followed_at || data.following?.created_at,
        is_subscribed: isSubscribed,
        subscription_tier: subscription.tier || subscription.type || (isSubscribed ? "tier1" : undefined),
        subscription_months: subscription.months || subscription.subscribed_for || data.subscription_months,
        subscribed_at: subscription.created_at || subscription.started_at,
        is_moderator: data.is_moderator || badgeTypes.includes("moderator") || badgeTypes.includes("mod"),
        is_vip: data.is_vip || badgeTypes.includes("vip"),
        is_og: data.is_og || badgeTypes.includes("og"),
        is_founder: data.is_founder || badgeTypes.includes("founder"),
        badges: badges,
      };
    }

    console.log("[KICK_API] Channel /me failed:", response.status);
  } catch (err) {
    console.error("[KICK_API] Channel /me error:", err);
  }

  return defaultRelationship;
}

// ============================================
// MAIN SYNC HANDLER
// ============================================

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
    const clientId = Deno.env.get("KICK_CLIENT_ID")!;
    const clientSecret = Deno.env.get("KICK_CLIENT_SECRET")!;

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.log("[SYNC] User verification failed:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized", reason: "user_verification_failed" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRole);

    // Get kick account
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

    console.log("[SYNC] Starting sync for:", kickAccount.kick_username);

    // Check if token needs refresh
    let accessToken = kickAccount.access_token;
    const tokenExpiry = new Date(kickAccount.access_token_expires_at);
    
    if (tokenExpiry < new Date(Date.now() + 5 * 60 * 1000)) { // 5 min buffer
      console.log("[SYNC] Token expired or expiring, refreshing...");
      const newTokens = await refreshAccessToken(kickAccount.refresh_token, clientId, clientSecret);
      
      if (newTokens) {
        accessToken = newTokens.accessToken;
        await supabaseAdmin
          .from("kick_accounts")
          .update({
            access_token: newTokens.accessToken,
            refresh_token: newTokens.refreshToken,
            access_token_expires_at: newTokens.expiresAt,
          })
          .eq("user_id", user.id);
        console.log("[SYNC] Token refreshed successfully");
      } else {
        console.log("[SYNC] Token refresh failed, using existing token");
      }
    }

    // Fetch fresh channel relationship data
    const relationship = await fetchChannelRelationship(accessToken, HADESOST_CHANNEL_SLUG);
    const now = new Date();

    // Update kick_accounts with fresh data
    await supabaseAdmin
      .from("kick_accounts")
      .update({
        is_subscriber: relationship.is_subscribed,
        subscription_tier: relationship.subscription_tier,
        subscription_months: relationship.subscription_months,
        subscribed_at: relationship.subscribed_at,
        is_follower: relationship.is_following,
        followed_at: relationship.followed_at,
        is_moderator: relationship.is_moderator,
        is_vip: relationship.is_vip,
        is_og: relationship.is_og,
        is_founder: relationship.is_founder,
        badges: relationship.badges,
        last_synced_at: now.toISOString(),
      })
      .eq("user_id", user.id);

    // Calculate follow months
    let followMonths = 0;
    if (relationship.followed_at) {
      followMonths = Math.floor((now.getTime() - new Date(relationship.followed_at).getTime()) / (1000 * 60 * 60 * 24 * 30));
    }

    // Get existing stats for monthly activity
    const { data: existingStats } = await supabaseAdmin
      .from("kick_user_stats")
      .select("monthly_activity, total_messages, messages_this_month, total_watch_time_minutes, watch_time_this_month, loyalty_points, channel_points, total_donations, donation_count, most_active_hour, most_active_day, special_badges, subscription_streak")
      .eq("user_id", user.id)
      .maybeSingle();

    // Update monthly activity
    const monthlyActivity = existingStats?.monthly_activity || [];
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthIndex = monthlyActivity.findIndex((m: any) => m.month === currentMonth);
    
    if (monthIndex >= 0) {
      monthlyActivity[monthIndex].activity_count = (monthlyActivity[monthIndex].activity_count || 0) + 1;
      monthlyActivity[monthIndex].last_active = now.toISOString();
    } else {
      monthlyActivity.push({
        month: currentMonth,
        activity_count: 1,
        messages: 0,
        watch_time_minutes: 0,
        last_active: now.toISOString(),
      });
      if (monthlyActivity.length > 12) monthlyActivity.shift();
    }

    // Upsert kick_user_stats
    const { data: updatedStats, error: upsertError } = await supabaseAdmin
      .from("kick_user_stats")
      .upsert({
        user_id: user.id,
        kick_user_id: kickAccount.kick_user_id,
        kick_username: kickAccount.kick_username,
        subscription_start_date: relationship.subscribed_at,
        subscription_months: relationship.subscription_months || 0,
        subscription_streak: relationship.is_subscribed 
          ? (existingStats?.subscription_streak || 0) + (relationship.subscription_months || 1)
          : 0,
        renewal_cycle: relationship.subscription_tier === "gifted" ? "gifted" : "monthly",
        followed_at: relationship.followed_at,
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
        badges: relationship.badges,
        special_badges: existingStats?.special_badges || [],
        monthly_activity: monthlyActivity,
        last_synced_at: now.toISOString(),
        updated_at: now.toISOString(),
      }, {
        onConflict: "user_id,kick_user_id",
      })
      .select()
      .single();

    if (upsertError) {
      console.error("[SYNC] Stats upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to sync stats" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[SYNC] Complete for:", kickAccount.kick_username, {
      isSubscriber: relationship.is_subscribed,
      subMonths: relationship.subscription_months,
      isFollower: relationship.is_following,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        stats: updatedStats,
        relationship: {
          is_subscribed: relationship.is_subscribed,
          subscription_tier: relationship.subscription_tier,
          subscription_months: relationship.subscription_months,
          is_following: relationship.is_following,
          is_moderator: relationship.is_moderator,
          is_vip: relationship.is_vip,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[SYNC] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
