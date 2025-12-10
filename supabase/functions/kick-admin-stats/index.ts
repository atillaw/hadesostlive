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

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "summary";

    console.log("Admin stats action:", action);

    if (action === "summary") {
      // Get overall summary
      const { data: totalStats, error: statsError } = await supabaseAdmin
        .from("kick_user_stats")
        .select("*");

      if (statsError) {
        throw statsError;
      }

      const totalSubscribers = totalStats?.filter(s => s.subscription_months > 0).length || 0;
      const totalFollowers = totalStats?.filter(s => s.follow_months > 0).length || 0;
      const avgSubMonths = totalStats?.filter(s => s.subscription_months > 0)
        .reduce((acc, s) => acc + s.subscription_months, 0) / totalSubscribers || 0;
      const totalMessages = totalStats?.reduce((acc, s) => acc + (s.total_messages || 0), 0) || 0;
      const totalDonations = totalStats?.reduce((acc, s) => acc + Number(s.total_donations || 0), 0) || 0;
      const totalLoyaltyPoints = totalStats?.reduce((acc, s) => acc + (s.loyalty_points || 0), 0) || 0;

      // Subscription tier breakdown
      const tierBreakdown: Record<number, number> = {};
      totalStats?.forEach(s => {
        if (s.subscription_months > 0) {
          const tier = s.subscription_months;
          tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
        }
      });

      // Convert to array for charts
      const tierData = Object.entries(tierBreakdown)
        .map(([months, count]) => ({ months: Number(months), count }))
        .sort((a, b) => a.months - b.months);

      // Get recent activity
      const { data: recentActivity } = await supabaseAdmin
        .from("kick_user_stats")
        .select("kick_username, subscription_months, last_seen_at, total_messages")
        .order("last_seen_at", { ascending: false })
        .limit(20);

      return new Response(
        JSON.stringify({
          summary: {
            totalSubscribers,
            totalFollowers,
            avgSubMonths: Math.round(avgSubMonths * 10) / 10,
            totalMessages,
            totalDonations,
            totalLoyaltyPoints,
            totalUsers: totalStats?.length || 0,
          },
          tierData,
          recentActivity: recentActivity || [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "subscribers") {
      // Get all subscribers with detailed info
      const { data: subscribers, error } = await supabaseAdmin
        .from("kick_user_stats")
        .select("*")
        .gt("subscription_months", 0)
        .order("subscription_months", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ subscribers: subscribers || [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "top-chatters") {
      const { data: topChatters, error } = await supabaseAdmin
        .from("kick_user_stats")
        .select("kick_username, total_messages, messages_this_month, most_active_hour, most_active_day")
        .order("total_messages", { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(
        JSON.stringify({ topChatters: topChatters || [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "loyalty-leaderboard") {
      const { data: leaderboard, error } = await supabaseAdmin
        .from("kick_user_stats")
        .select("kick_username, loyalty_points, subscription_months, total_messages, badges")
        .order("loyalty_points", { ascending: false })
        .limit(100);

      if (error) throw error;

      return new Response(
        JSON.stringify({ leaderboard: leaderboard || [] }),
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
    console.error("Admin stats error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
