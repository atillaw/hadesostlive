import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FRONTEND_URL = "https://hadesost.uk";
const HADESOST_CHANNEL_SLUG = "hadesost";

// ============================================
// KICK API SERVICE - Production-grade API calls
// ============================================

interface KickUserProfile {
  id: number;
  username: string;
  profile_pic?: string;
  bio?: string;
  email?: string;
}

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

interface KickSyncResult {
  user: KickUserProfile | null;
  channelRelationship: KickChannelRelationship;
  errors: string[];
}

/**
 * Fetch authenticated user's profile from Kick API
 */
async function fetchKickUserProfile(accessToken: string): Promise<{ data: KickUserProfile | null; error: string | null }> {
  console.log("[KICK_API] Fetching user profile...");
  
  // Try v1 public API first
  try {
    const response = await fetch("https://api.kick.com/public/v1/users", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.data?.[0] || data;
      console.log("[KICK_API] User profile fetched via v1:", user?.username);
      return { data: user, error: null };
    }

    console.log("[KICK_API] v1 user endpoint failed:", response.status);
  } catch (err) {
    console.log("[KICK_API] v1 user endpoint error:", err);
  }

  // Fallback to v2 API
  try {
    const response = await fetch("https://kick.com/api/v2/user", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const user = await response.json();
      console.log("[KICK_API] User profile fetched via v2:", user?.username);
      return { data: user, error: null };
    }

    const errorText = await response.text();
    console.log("[KICK_API] v2 user endpoint failed:", response.status, errorText);
    return { data: null, error: `User fetch failed: ${response.status}` };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.log("[KICK_API] v2 user endpoint error:", errorMsg);
    return { data: null, error: errorMsg };
  }
}

/**
 * Fetch user's relationship to hadesost channel (sub status, follow, mod/vip roles)
 * This is the CRITICAL endpoint that returns subscription and role data
 */
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

  // /api/v2/channels/{channel}/me - Returns user's relationship to channel
  try {
    const response = await fetch(`https://kick.com/api/v2/channels/${channelSlug}/me`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("[KICK_API] Channel relationship raw data:", JSON.stringify(data));

      // Parse subscription data
      const subscription = data.subscription || data.subscriber || {};
      const isSubscribed = !!(subscription.id || data.is_subscribed || data.is_subscriber);
      
      // Parse badges
      const badges = data.badges || data.chat_identity?.badges || [];
      
      // Determine roles from badges or direct fields
      const badgeTypes = badges.map((b: any) => b.type?.toLowerCase() || b.badge_type?.toLowerCase() || "");
      const isModerator = data.is_moderator || badgeTypes.includes("moderator") || badgeTypes.includes("mod");
      const isVip = data.is_vip || badgeTypes.includes("vip");
      const isOg = data.is_og || badgeTypes.includes("og");
      const isFounder = data.is_founder || badgeTypes.includes("founder");

      const result: KickChannelRelationship = {
        is_following: !!data.is_following || !!data.followed_at,
        followed_at: data.followed_at || data.following?.created_at,
        is_subscribed: isSubscribed,
        subscription_tier: subscription.tier || subscription.type || (isSubscribed ? "tier1" : undefined),
        subscription_months: subscription.months || subscription.subscribed_for || data.subscription_months,
        subscribed_at: subscription.created_at || subscription.started_at,
        is_moderator: isModerator,
        is_vip: isVip,
        is_og: isOg,
        is_founder: isFounder,
        badges: badges,
      };

      console.log("[KICK_API] Parsed channel relationship:", JSON.stringify(result));
      return result;
    }

    console.log("[KICK_API] Channel /me endpoint failed:", response.status, await response.text());
  } catch (err) {
    console.log("[KICK_API] Channel /me endpoint error:", err);
  }

  // Fallback: Try to get follow status separately
  try {
    const followResponse = await fetch(`https://kick.com/api/v2/channels/${channelSlug}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (followResponse.ok) {
      const channelData = await followResponse.json();
      console.log("[KICK_API] Channel data (fallback):", channelData?.user?.username);
      
      // Some channel responses include viewer relationship
      if (channelData.viewer) {
        defaultRelationship.is_following = !!channelData.viewer.is_following;
        defaultRelationship.is_subscribed = !!channelData.viewer.is_subscribed;
      }
    }
  } catch (err) {
    console.log("[KICK_API] Channel fallback error:", err);
  }

  return defaultRelationship;
}

/**
 * Full sync: Fetch all user data from Kick after OAuth
 */
async function syncKickUserData(accessToken: string): Promise<KickSyncResult> {
  console.log("[KICK_SYNC] Starting full data sync...");
  const errors: string[] = [];

  // Fetch user profile
  const { data: user, error: userError } = await fetchKickUserProfile(accessToken);
  if (userError) {
    errors.push(`User profile: ${userError}`);
  }

  // Fetch channel relationship (sub status, follow, roles)
  const channelRelationship = await fetchChannelRelationship(accessToken, HADESOST_CHANNEL_SLUG);

  console.log("[KICK_SYNC] Sync complete:", {
    user: user?.username,
    isSubscriber: channelRelationship.is_subscribed,
    isFollower: channelRelationship.is_following,
    isMod: channelRelationship.is_moderator,
    isVip: channelRelationship.is_vip,
    subMonths: channelRelationship.subscription_months,
    errors: errors.length,
  });

  return { user, channelRelationship, errors };
}

// ============================================
// DATABASE SERVICE - Store synced data
// ============================================

interface StoreKickDataParams {
  userId: string;
  kickUserId: string;
  kickUsername: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: KickUserProfile | null;
  relationship: KickChannelRelationship;
}

async function storeKickData(supabaseAdmin: any, params: StoreKickDataParams): Promise<void> {
  console.log("[DB] Storing Kick data for user:", params.kickUsername);

  const {
    userId,
    kickUserId,
    kickUsername,
    accessToken,
    refreshToken,
    expiresAt,
    user,
    relationship,
  } = params;

  // Delete existing kick account
  await supabaseAdmin.from("kick_accounts").delete().eq("user_id", userId);

  // Insert kick_accounts with full data
  const { error: accountError } = await supabaseAdmin.from("kick_accounts").insert({
    user_id: userId,
    kick_user_id: kickUserId,
    kick_username: kickUsername,
    kick_channel_slug: kickUsername.toLowerCase(),
    kick_display_name: user?.username || kickUsername,
    kick_avatar_url: user?.profile_pic,
    access_token: accessToken,
    refresh_token: refreshToken,
    access_token_expires_at: expiresAt,
    // Channel relationship data
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
    verified_via: "oauth",
    last_synced_at: new Date().toISOString(),
  });

  if (accountError) {
    console.error("[DB] Failed to store kick_accounts:", accountError);
    throw new Error(`Database error: ${accountError.message}`);
  }

  // Upsert kick_user_stats for detailed stats tracking
  const now = new Date();
  const { error: statsError } = await supabaseAdmin.from("kick_user_stats").upsert({
    user_id: userId,
    kick_user_id: kickUserId,
    kick_username: kickUsername,
    subscription_start_date: relationship.subscribed_at,
    subscription_months: relationship.subscription_months || 0,
    subscription_streak: relationship.is_subscribed ? 1 : 0,
    followed_at: relationship.followed_at,
    follow_months: relationship.followed_at 
      ? Math.floor((now.getTime() - new Date(relationship.followed_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0,
    badges: relationship.badges,
    last_synced_at: now.toISOString(),
    updated_at: now.toISOString(),
  }, {
    onConflict: "user_id,kick_user_id",
  });

  if (statsError) {
    console.error("[DB] Failed to upsert kick_user_stats:", statsError);
    // Non-critical, don't throw
  }

  // Update profiles table for backward compatibility
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      kick_username: kickUsername,
      kick_connected_at: now.toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    console.error("[DB] Failed to update profile:", profileError);
    // Non-critical, don't throw
  }

  console.log("[DB] All data stored successfully");
}

// ============================================
// MAIN OAUTH CALLBACK HANDLER
// ============================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[OAUTH_CALLBACK] ====== START ======");

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    // Step 1: Handle OAuth errors
    if (error) {
      console.log("[OAUTH_CALLBACK] OAuth error from Kick:", error, errorDescription);
      return redirectWithError("oauth_error", `${error}: ${errorDescription || "Unknown error"}`);
    }

    if (!code || !state) {
      console.log("[OAUTH_CALLBACK] Missing code or state");
      return redirectWithError("missing_params", "Code or state missing");
    }

    console.log("[OAUTH_CALLBACK] Received code and state");

    // Step 2: Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const clientId = Deno.env.get("KICK_CLIENT_ID")!;
    const clientSecret = Deno.env.get("KICK_CLIENT_SECRET")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRole);
    const redirectUri = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/kick-oauth-callback`;

    // Step 3: Verify state and get code_verifier
    console.log("[OAUTH_CALLBACK] Verifying state...");
    const { data: oauthState, error: stateError } = await supabaseAdmin
      .from("kick_oauth_states")
      .select("*")
      .eq("state", state)
      .single();

    if (stateError || !oauthState) {
      console.log("[OAUTH_CALLBACK] Invalid state:", stateError?.message);
      return redirectWithError("invalid_state", "State verification failed");
    }

    if (new Date(oauthState.expires_at) < new Date()) {
      console.log("[OAUTH_CALLBACK] State expired");
      await supabaseAdmin.from("kick_oauth_states").delete().eq("id", oauthState.id);
      return redirectWithError("state_expired", "OAuth state expired, please try again");
    }

    const userId = oauthState.user_id;
    const codeVerifier = oauthState.code_verifier;
    console.log("[OAUTH_CALLBACK] State valid for user:", userId);

    // Clean up used state
    await supabaseAdmin.from("kick_oauth_states").delete().eq("id", oauthState.id);

    // Step 4: Exchange code for tokens (PKCE)
    console.log("[OAUTH_CALLBACK] Exchanging code for tokens...");
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
      console.log("[OAUTH_CALLBACK] Token exchange failed:", JSON.stringify(tokenData));
      const errorReason = tokenData.error_description || tokenData.error || "Token exchange failed";
      return redirectWithError("token_failed", errorReason);
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    const grantedScope = tokenData.scope || "";

    console.log("[OAUTH_CALLBACK] Tokens received. Scope:", grantedScope, "Expires in:", expiresIn);

    // Step 5: AUTOMATIC DATA SYNC CHAIN - This is where the magic happens
    console.log("[OAUTH_CALLBACK] Starting automatic data sync chain...");
    const syncResult = await syncKickUserData(accessToken);

    if (!syncResult.user) {
      console.log("[OAUTH_CALLBACK] Failed to fetch user profile, sync errors:", syncResult.errors);
      return redirectWithError("user_fetch_failed", "Could not fetch Kick user profile");
    }

    // Step 6: Store everything in database
    console.log("[OAUTH_CALLBACK] Storing all data to database...");
    await storeKickData(supabaseAdmin, {
      userId,
      kickUserId: String(syncResult.user.id),
      kickUsername: syncResult.user.username,
      accessToken,
      refreshToken,
      expiresAt,
      user: syncResult.user,
      relationship: syncResult.channelRelationship,
    });

    // Log sync summary
    const elapsed = Date.now() - startTime;
    console.log("[OAUTH_CALLBACK] ====== SUCCESS ======");
    console.log("[OAUTH_CALLBACK] Summary:", {
      user: syncResult.user.username,
      isSubscriber: syncResult.channelRelationship.is_subscribed,
      subTier: syncResult.channelRelationship.subscription_tier,
      subMonths: syncResult.channelRelationship.subscription_months,
      isFollower: syncResult.channelRelationship.is_following,
      isMod: syncResult.channelRelationship.is_moderator,
      isVip: syncResult.channelRelationship.is_vip,
      badges: syncResult.channelRelationship.badges.length,
      syncErrors: syncResult.errors.length,
      elapsed: `${elapsed}ms`,
    });

    // Return success with sync info
    const successParams = new URLSearchParams({
      kick_connected: "success",
      kick_user: syncResult.user.username,
      is_sub: syncResult.channelRelationship.is_subscribed ? "1" : "0",
      sub_months: String(syncResult.channelRelationship.subscription_months || 0),
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${FRONTEND_URL}/kullanici-ayarlari?${successParams.toString()}`,
        ...corsHeaders,
      },
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[OAUTH_CALLBACK] Unhandled error:", errorMessage);
    return redirectWithError("server_error", errorMessage);
  }
});

function redirectWithError(code: string, details: string): Response {
  console.log("[OAUTH_CALLBACK] Redirecting with error:", code, details);
  const params = new URLSearchParams({
    kick_error: code,
    error_details: details.substring(0, 200), // Limit length
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${FRONTEND_URL}/kullanici-ayarlari?${params.toString()}`,
      ...corsHeaders,
    },
  });
}
