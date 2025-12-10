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
    const authHeader = req.headers.get("Authorization");
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

    // Extract the JWT token from the authorization header
    const token = authHeader.replace("Bearer ", "");

    // Verify the user using the token directly
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
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
      .single();

    if (accountError || !kickAccount) {
      return new Response(JSON.stringify({ error: "No Kick account linked" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if token needs refresh (expires in less than 5 minutes)
    const expiresAt = new Date(kickAccount.access_token_expires_at);
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

    if (expiresAt > fiveMinutesFromNow) {
      // Token is still valid
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Token still valid",
          expires_at: kickAccount.access_token_expires_at 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Refresh the token
    console.log("Refreshing Kick token for user:", user.id);
    
    const tokenResponse = await fetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: kickAccount.refresh_token,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Token refresh failed:", tokenData);
      
      // If refresh token is invalid, delete the kick account
      if (tokenData.error === "invalid_grant") {
        await supabaseAdmin.from("kick_accounts").delete().eq("user_id", user.id);
        await supabaseAdmin
          .from("profiles")
          .update({ kick_username: null, kick_connected_at: null })
          .eq("id", user.id);
      }

      return new Response(
        JSON.stringify({ error: "Token refresh failed", details: tokenData }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const newAccessToken = tokenData.access_token;
    const newRefreshToken = tokenData.refresh_token || kickAccount.refresh_token;
    const expiresIn = tokenData.expires_in || 3600;
    const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Update kick account with new tokens
    const { error: updateError } = await supabaseAdmin
      .from("kick_accounts")
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        access_token_expires_at: newExpiresAt,
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update tokens:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update tokens" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Token refreshed successfully for user:", user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Token refreshed",
        expires_at: newExpiresAt 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Token refresh error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
