import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FRONTEND_URL = "https://hadesost.uk";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle OAuth errors from Kick
    if (error) {
      console.log("Kick OAuth error:", error);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${FRONTEND_URL}/kullanici-ayarlari?kick_error=${encodeURIComponent(error)}`,
          ...corsHeaders,
        },
      });
    }

    if (!code || !state) {
      console.log("Missing code or state");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${FRONTEND_URL}/kullanici-ayarlari?kick_error=missing_params`,
          ...corsHeaders,
        },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const clientId = Deno.env.get("KICK_CLIENT_ID")!;
    const clientSecret = Deno.env.get("KICK_CLIENT_SECRET")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRole);
    const redirectUri = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/kick-oauth-callback`;

    // Verify state and get code_verifier
    const { data: oauthState, error: stateError } = await supabaseAdmin
      .from("kick_oauth_states")
      .select("*")
      .eq("state", state)
      .single();

    if (stateError || !oauthState) {
      console.log("Invalid or expired state:", stateError);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${FRONTEND_URL}/kullanici-ayarlari?kick_error=invalid_state`,
          ...corsHeaders,
        },
      });
    }

    // Check if state is expired
    if (new Date(oauthState.expires_at) < new Date()) {
      console.log("OAuth state expired");
      await supabaseAdmin.from("kick_oauth_states").delete().eq("id", oauthState.id);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${FRONTEND_URL}/kullanici-ayarlari?kick_error=state_expired`,
          ...corsHeaders,
        },
      });
    }

    const userId = oauthState.user_id;
    const codeVerifier = oauthState.code_verifier;

    // Delete the used state
    await supabaseAdmin.from("kick_oauth_states").delete().eq("id", oauthState.id);

    // Exchange code for tokens with PKCE
    console.log("Exchanging code for tokens...");
    const tokenResponse = await fetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.log("Token exchange failed:", tokenData);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${FRONTEND_URL}/kullanici-ayarlari?kick_error=token_exchange_failed`,
          ...corsHeaders,
        },
      });
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Fetch user profile from Kick API
    console.log("Fetching Kick user profile...");
    const userResponse = await fetch("https://api.kick.com/public/v1/users", {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        "Accept": "application/json"
      },
    });

    if (!userResponse.ok) {
      // Try alternative endpoint
      console.log("Primary endpoint failed, trying v2...");
      const userResponseV2 = await fetch("https://kick.com/api/v2/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponseV2.ok) {
        const errorText = await userResponseV2.text();
        console.log("User fetch failed:", errorText);
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${FRONTEND_URL}/kullanici-ayarlari?kick_error=user_fetch_failed`,
            ...corsHeaders,
          },
        });
      }

      const userData = await userResponseV2.json();
      
      // Store kick account
      await storeKickAccount(supabaseAdmin, userId, {
        kickUserId: String(userData.id),
        kickUsername: userData.username,
        kickChannelSlug: userData.username?.toLowerCase(),
        kickDisplayName: userData.username,
        kickAvatarUrl: userData.profile_pic,
        accessToken,
        refreshToken,
        expiresAt,
      });

      // Update profiles table for backward compatibility
      await supabaseAdmin
        .from("profiles")
        .update({
          kick_username: userData.username,
          kick_connected_at: new Date().toISOString(),
        })
        .eq("id", userId);

      return new Response(null, {
        status: 302,
        headers: {
          Location: `${FRONTEND_URL}/kullanici-ayarlari?kick_connected=success`,
          ...corsHeaders,
        },
      });
    }

    const userData = await userResponse.json();
    const kickUser = userData.data?.[0] || userData;

    // Store kick account
    await storeKickAccount(supabaseAdmin, userId, {
      kickUserId: String(kickUser.id || kickUser.user_id),
      kickUsername: kickUser.username || kickUser.name,
      kickChannelSlug: kickUser.channel?.slug || kickUser.username?.toLowerCase(),
      kickDisplayName: kickUser.display_name || kickUser.username,
      kickAvatarUrl: kickUser.profile_pic || kickUser.avatar,
      accessToken,
      refreshToken,
      expiresAt,
    });

    // Update profiles table for backward compatibility
    await supabaseAdmin
      .from("profiles")
      .update({
        kick_username: kickUser.username || kickUser.name,
        kick_connected_at: new Date().toISOString(),
      })
      .eq("id", userId);

    console.log("Kick account linked successfully for user:", userId);

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${FRONTEND_URL}/kullanici-ayarlari?kick_connected=success`,
        ...corsHeaders,
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("OAuth callback error:", errorMessage);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${FRONTEND_URL}/kullanici-ayarlari?kick_error=server_error`,
        ...corsHeaders,
      },
    });
  }
});

interface KickAccountData {
  kickUserId: string;
  kickUsername: string;
  kickChannelSlug?: string;
  kickDisplayName?: string;
  kickAvatarUrl?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// deno-lint-ignore no-explicit-any
async function storeKickAccount(
  supabase: any,
  userId: string,
  data: KickAccountData
) {
  // Delete existing kick account for this user
  await supabase.from("kick_accounts").delete().eq("user_id", userId);

  // Insert new kick account
  const { error } = await supabase.from("kick_accounts").insert({
    user_id: userId,
    kick_user_id: data.kickUserId,
    kick_username: data.kickUsername,
    kick_channel_slug: data.kickChannelSlug,
    kick_display_name: data.kickDisplayName,
    kick_avatar_url: data.kickAvatarUrl,
    access_token: data.accessToken,
    refresh_token: data.refreshToken,
    access_token_expires_at: data.expiresAt,
  });

  if (error) {
    console.error("Failed to store kick account:", error);
    throw new Error("Failed to store kick account");
  }
}
