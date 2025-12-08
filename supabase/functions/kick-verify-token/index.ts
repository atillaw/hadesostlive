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
    // Verify user is authenticated
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

    // Verify user
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRole);

    // Find the token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("kick_connect_tokens")
      .select("*")
      .eq("token", token.toUpperCase().trim())
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.log("Token not found or expired:", token);
      return new Response(JSON.stringify({ error: "Geçersiz veya süresi dolmuş token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if this Kick account is already linked to another user
    const { data: existingAccount } = await supabaseAdmin
      .from("kick_accounts")
      .select("user_id")
      .eq("kick_user_id", tokenData.kick_user_id)
      .maybeSingle();

    if (existingAccount && existingAccount.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Bu Kick hesabı başka bir kullanıcıya bağlı" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already has a Kick account linked
    const { data: userExistingAccount } = await supabaseAdmin
      .from("kick_accounts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (userExistingAccount) {
      // Update existing account
      const { error: updateError } = await supabaseAdmin
        .from("kick_accounts")
        .update({
          kick_user_id: tokenData.kick_user_id,
          kick_username: tokenData.kick_username,
          kick_display_name: tokenData.kick_display_name,
          kick_avatar_url: tokenData.kick_avatar_url,
          kick_channel_slug: tokenData.kick_channel_slug,
          access_token: "bot_verified", // No OAuth token for bot verification
          refresh_token: "bot_verified",
          access_token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          verified_via: "bot",
          is_follower: tokenData.kick_data?.is_follower || false,
          followed_at: tokenData.kick_data?.followed_at || null,
          is_subscriber: tokenData.kick_data?.is_subscriber || false,
          subscription_tier: tokenData.kick_data?.subscription_tier || null,
          subscribed_at: tokenData.kick_data?.subscribed_at || null,
          subscription_months: tokenData.kick_data?.subscription_months || 0,
          is_moderator: tokenData.kick_data?.is_moderator || false,
          is_vip: tokenData.kick_data?.is_vip || false,
          is_og: tokenData.kick_data?.is_og || false,
          is_founder: tokenData.kick_data?.is_founder || false,
          badges: tokenData.kick_data?.badges || [],
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userExistingAccount.id);

      if (updateError) {
        console.error("Failed to update kick account:", updateError);
        return new Response(JSON.stringify({ error: "Hesap güncellenemedi" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Create new account
      const { error: insertError } = await supabaseAdmin
        .from("kick_accounts")
        .insert({
          user_id: user.id,
          kick_user_id: tokenData.kick_user_id,
          kick_username: tokenData.kick_username,
          kick_display_name: tokenData.kick_display_name,
          kick_avatar_url: tokenData.kick_avatar_url,
          kick_channel_slug: tokenData.kick_channel_slug,
          access_token: "bot_verified",
          refresh_token: "bot_verified",
          access_token_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          verified_via: "bot",
          is_follower: tokenData.kick_data?.is_follower || false,
          followed_at: tokenData.kick_data?.followed_at || null,
          is_subscriber: tokenData.kick_data?.is_subscriber || false,
          subscription_tier: tokenData.kick_data?.subscription_tier || null,
          subscribed_at: tokenData.kick_data?.subscribed_at || null,
          subscription_months: tokenData.kick_data?.subscription_months || 0,
          is_moderator: tokenData.kick_data?.is_moderator || false,
          is_vip: tokenData.kick_data?.is_vip || false,
          is_og: tokenData.kick_data?.is_og || false,
          is_founder: tokenData.kick_data?.is_founder || false,
          badges: tokenData.kick_data?.badges || [],
          last_synced_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Failed to create kick account:", insertError);
        return new Response(JSON.stringify({ error: "Hesap oluşturulamadı" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Mark token as used
    await supabaseAdmin
      .from("kick_connect_tokens")
      .update({
        is_used: true,
        used_by_user_id: user.id,
        used_at: new Date().toISOString(),
      })
      .eq("id", tokenData.id);

    // Update profiles table for backward compatibility
    await supabaseAdmin
      .from("profiles")
      .update({
        kick_username: tokenData.kick_username,
        kick_connected_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    console.log(`User ${user.id} successfully linked Kick account: ${tokenData.kick_username}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Kick hesabın başarıyla bağlandı!",
        kick_username: tokenData.kick_username,
        kick_avatar_url: tokenData.kick_avatar_url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Token verification error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
