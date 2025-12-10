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
    console.log("Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.log("No authorization header found");
      return new Response(JSON.stringify({ error: "Unauthorized", reason: "no_auth_header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.log("User verification error:", userError.message);
      return new Response(JSON.stringify({ error: "Unauthorized", reason: "user_verification_failed" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!user) {
      console.log("No user found");
      return new Response(JSON.stringify({ error: "Unauthorized", reason: "no_user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("User verified:", user.id);

    const supabaseAdmin = createClient(supabaseUrl, serviceRole);

    // Get kick account with all fields (without exposing tokens)
    const { data: kickAccount, error: accountError } = await supabaseAdmin
      .from("kick_accounts")
      .select(`
        id, 
        kick_user_id, 
        kick_username, 
        kick_channel_slug, 
        kick_display_name, 
        kick_avatar_url, 
        access_token_expires_at, 
        created_at, 
        updated_at,
        verified_via,
        is_follower,
        followed_at,
        is_subscriber,
        subscription_tier,
        subscribed_at,
        subscription_months,
        is_moderator,
        is_vip,
        is_og,
        is_founder,
        badges,
        last_synced_at
      `)
      .eq("user_id", user.id)
      .maybeSingle();

    if (accountError) {
      console.log("Account fetch error:", accountError.message);
      return new Response(
        JSON.stringify({ connected: false, account: null }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!kickAccount) {
      console.log("No kick account found for user");
      return new Response(
        JSON.stringify({ connected: false, account: null }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if token is expired
    const isExpired = new Date(kickAccount.access_token_expires_at) < new Date();

    console.log("Kick account found:", kickAccount.kick_username);

    return new Response(
      JSON.stringify({ 
        connected: true, 
        account: {
          ...kickAccount,
          is_token_expired: isExpired,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Get account error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
