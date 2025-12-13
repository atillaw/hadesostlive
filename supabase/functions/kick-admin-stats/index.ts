import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Check if user is admin
    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get action from body or query params
    let action = "summary";
    try {
      const body = await req.json();
      action = body.action || "summary";
    } catch {
      const url = new URL(req.url);
      action = url.searchParams.get("action") || "summary";
    }

    console.log("[ADMIN_STATS] Action:", action);

    // Always fetch from BOTH tables and merge data
    // kick_accounts is the primary source (from OAuth), kick_user_stats has extended data
    const { data: kickAccounts } = await supabaseAdmin
      .from("kick_accounts")
      .select("*");

    const { data: kickStats } = await supabaseAdmin
      .from("kick_user_stats")
      .select("*");

    // Merge data: use kick_accounts as base, enrich with kick_user_stats
    const mergedUsers = (kickAccounts || []).map(account => {
      const stats = kickStats?.find(s => s.user_id === account.user_id) || {};
      return {
        id: account.id,
        user_id: account.user_id,
        kick_user_id: account.kick_user_id,
        kick_username: account.kick_username,
        kick_display_name: account.kick_display_name,
        kick_avatar_url: account.kick_avatar_url,
        // Subscription data from kick_accounts (primary) or kick_user_stats (fallback)
        is_subscriber: account.is_subscriber || false,
        subscription_tier: account.subscription_tier,
        subscription_months: account.subscription_months || stats.subscription_months || 0,
        subscription_streak: stats.subscription_streak || 0,
        subscribed_at: account.subscribed_at || stats.subscription_start_date,
        // Follow data
        is_follower: account.is_follower || false,
        followed_at: account.followed_at || stats.followed_at,
        follow_months: stats.follow_months || 0,
        // Roles
        is_moderator: account.is_moderator || false,
        is_vip: account.is_vip || false,
        is_og: account.is_og || false,
        is_founder: account.is_founder || false,
        // Stats from kick_user_stats
        total_messages: stats.total_messages || 0,
        messages_this_month: stats.messages_this_month || 0,
        most_active_hour: stats.most_active_hour,
        most_active_day: stats.most_active_day,
        total_watch_time_minutes: stats.total_watch_time_minutes || 0,
        loyalty_points: stats.loyalty_points || 0,
        channel_points: stats.channel_points || 0,
        total_donations: stats.total_donations || 0,
        donation_count: stats.donation_count || 0,
        badges: account.badges || stats.badges || [],
        special_badges: stats.special_badges || [],
        // Metadata
        verified_via: account.verified_via,
        last_synced_at: account.last_synced_at || stats.last_synced_at,
        created_at: account.created_at,
      };
    });

    console.log(`[ADMIN_STATS] Merged ${mergedUsers.length} users`);

    if (action === "summary") {
      const subscribers = mergedUsers.filter(u => u.is_subscriber || u.subscription_months > 0);
      const followers = mergedUsers.filter(u => u.is_follower || u.follow_months > 0);
      
      const totalSubscribers = subscribers.length;
      const totalFollowers = followers.length;
      const avgSubMonths = totalSubscribers > 0
        ? subscribers.reduce((acc, s) => acc + (s.subscription_months || 0), 0) / totalSubscribers
        : 0;
      const totalMessages = mergedUsers.reduce((acc, s) => acc + (s.total_messages || 0), 0);
      const totalDonations = mergedUsers.reduce((acc, s) => acc + Number(s.total_donations || 0), 0);
      const totalLoyaltyPoints = mergedUsers.reduce((acc, s) => acc + (s.loyalty_points || 0), 0);

      // Subscription tier breakdown
      const tierBreakdown: Record<number, number> = {};
      subscribers.forEach(s => {
        const months = s.subscription_months || 1;
        tierBreakdown[months] = (tierBreakdown[months] || 0) + 1;
      });

      const tierData = Object.entries(tierBreakdown)
        .map(([months, count]) => ({ months: Number(months), count }))
        .sort((a, b) => a.months - b.months);

      // If no tier data but we have subscribers, add a default
      if (tierData.length === 0 && totalSubscribers > 0) {
        tierData.push({ months: 1, count: totalSubscribers });
      }

      // Role breakdown for extra insights
      const moderators = mergedUsers.filter(u => u.is_moderator).length;
      const vips = mergedUsers.filter(u => u.is_vip).length;
      const ogs = mergedUsers.filter(u => u.is_og).length;
      const founders = mergedUsers.filter(u => u.is_founder).length;

      // Recent activity - sort by last_synced_at
      const recentActivity = [...mergedUsers]
        .filter(u => u.last_synced_at)
        .sort((a, b) => new Date(b.last_synced_at!).getTime() - new Date(a.last_synced_at!).getTime())
        .slice(0, 20);

      return new Response(
        JSON.stringify({
          summary: {
            totalSubscribers,
            totalFollowers,
            avgSubMonths: Math.round(avgSubMonths * 10) / 10,
            totalMessages,
            totalDonations,
            totalLoyaltyPoints,
            totalUsers: mergedUsers.length,
            moderators,
            vips,
            ogs,
            founders,
          },
          tierData,
          recentActivity,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "subscribers") {
      const subscribers = mergedUsers
        .filter(u => u.is_subscriber || u.subscription_months > 0)
        .sort((a, b) => (b.subscription_months || 0) - (a.subscription_months || 0));

      return new Response(
        JSON.stringify({ subscribers }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "top-chatters") {
      const topChatters = [...mergedUsers]
        .sort((a, b) => (b.total_messages || 0) - (a.total_messages || 0))
        .slice(0, 50);

      return new Response(
        JSON.stringify({ topChatters }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "loyalty-leaderboard") {
      const leaderboard = [...mergedUsers]
        .sort((a, b) => (b.loyalty_points || 0) - (a.loyalty_points || 0))
        .slice(0, 100);

      return new Response(
        JSON.stringify({ leaderboard }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "all-users") {
      return new Response(
        JSON.stringify({ users: mergedUsers }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[ADMIN_STATS] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
