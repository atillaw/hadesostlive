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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // This should contain user_id

    console.log("OAuth callback received:", { code: code?.substring(0, 10), state });

    if (!code || !state) {
      console.error("Missing required parameters");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `https://hadesost.uk/kullanici-ayarlari?kick_error=missing_params`,
          ...corsHeaders,
        },
      });
    }

    const clientId = Deno.env.get("KICK_CLIENT_ID");
    const clientSecret = Deno.env.get("KICK_CLIENT_SECRET");
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/kick-oauth-callback`;

    // Exchange code for access token
    const tokenResponse = await fetch("https://kick.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `https://hadesost.uk/kullanici-ayarlari?kick_error=auth_failed`,
          ...corsHeaders,
        },
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Kick API
    const userResponse = await fetch("https://kick.com/api/v2/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("User info fetch failed:", errorText);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `https://hadesost.uk/kullanici-ayarlari?kick_error=user_fetch_failed`,
          ...corsHeaders,
        },
      });
    }

    const userData = await userResponse.json();
    const kickUsername = userData.username;

    // Update profile with Kick username
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        kick_username: kickUsername,
        kick_connected_at: new Date().toISOString(),
      })
      .eq("id", state);

    if (updateError) {
      console.error("Profile update failed:", updateError);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `https://hadesost.uk/kullanici-ayarlari?kick_error=profile_update_failed`,
          ...corsHeaders,
        },
      });
    }

    console.log("Successfully connected Kick account:", kickUsername);

    // Redirect back to settings page with success
    return new Response(null, {
      status: 302,
      headers: {
        Location: `https://hadesost.uk/kullanici-ayarlari?kick_connected=success`,
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in kick-oauth-callback:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
