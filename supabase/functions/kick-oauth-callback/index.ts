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
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "https://hadesost.uk/kullanici-ayarlari?kick_error=missing_params",
          ...corsHeaders,
        },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const clientId = Deno.env.get("KICK_CLIENT_ID")!;
    const clientSecret = Deno.env.get("KICK_CLIENT_SECRET")!;

    // 💀 ÖLÜMCÜL HATA BURADA DUZELTILDI:
    const redirectUri = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/kick-oauth-callback`;

    // TOKEN AL
    const tokenResponse = await fetch("https://kick.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.log("Token exchange failed:", tokenData);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "https://hadesost.uk/kullanici-ayarlari?kick_error=auth_failed",
          ...corsHeaders,
        },
      });
    }

    // USER DATA
    const userResponse = await fetch("https://kick.com/api/v2/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.log("User fetch failed:", errorText);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "https://hadesost.uk/kullanici-ayarlari?kick_error=user_fetch_failed",
          ...corsHeaders,
        },
      });
    }

    const userData = await userResponse.json();
    const kickUsername = userData.username;

    // PROFİL UPDATE
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRole);

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        kick_username: kickUsername,
        kick_connected_at: new Date().toISOString(),
      })
      .eq("id", state);

    if (updateError) {
      console.log("Profile update failed:", updateError);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "https://hadesost.uk/kullanici-ayarlari?kick_error=profile_update_failed",
          ...corsHeaders,
        },
      });
    }

    // BAŞARILI
    return new Response(null, {
      status: 302,
      headers: {
        Location: "https://hadesost.uk/kullanici-ayarlari?kick_connected=success",
        ...corsHeaders,
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
