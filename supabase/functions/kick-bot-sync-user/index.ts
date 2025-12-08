import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bot-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify bot secret
    const botSecret = req.headers.get("x-bot-secret");
    const expectedSecret = Deno.env.get("KICK_BOT_SECRET");
    
    if (!botSecret || botSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { 
      kick_user_id,
      kick_username,
      kick_data // Updated Kick data
    } = await req.json();

    if (!kick_user_id) {
      return new Response(JSON.stringify({ error: "kick_user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRole);

    // Find the kick account
    const { data: kickAccount, error: findError } = await supabaseAdmin
      .from("kick_accounts")
      .select("id, user_id")
      .eq("kick_user_id", kick_user_id)
      .maybeSingle();

    if (findError || !kickAccount) {
      return new Response(JSON.stringify({ error: "Kick account not found", synced: false }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update the account with new data
    const updateData: Record<string, unknown> = {
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (kick_username) updateData.kick_username = kick_username;
    if (kick_data?.kick_display_name) updateData.kick_display_name = kick_data.kick_display_name;
    if (kick_data?.kick_avatar_url) updateData.kick_avatar_url = kick_data.kick_avatar_url;
    if (kick_data?.kick_channel_slug) updateData.kick_channel_slug = kick_data.kick_channel_slug;
    if (typeof kick_data?.is_follower === "boolean") updateData.is_follower = kick_data.is_follower;
    if (kick_data?.followed_at) updateData.followed_at = kick_data.followed_at;
    if (typeof kick_data?.is_subscriber === "boolean") updateData.is_subscriber = kick_data.is_subscriber;
    if (kick_data?.subscription_tier) updateData.subscription_tier = kick_data.subscription_tier;
    if (kick_data?.subscribed_at) updateData.subscribed_at = kick_data.subscribed_at;
    if (typeof kick_data?.subscription_months === "number") updateData.subscription_months = kick_data.subscription_months;
    if (typeof kick_data?.is_moderator === "boolean") updateData.is_moderator = kick_data.is_moderator;
    if (typeof kick_data?.is_vip === "boolean") updateData.is_vip = kick_data.is_vip;
    if (typeof kick_data?.is_og === "boolean") updateData.is_og = kick_data.is_og;
    if (typeof kick_data?.is_founder === "boolean") updateData.is_founder = kick_data.is_founder;
    if (kick_data?.badges) updateData.badges = kick_data.badges;

    const { error: updateError } = await supabaseAdmin
      .from("kick_accounts")
      .update(updateData)
      .eq("id", kickAccount.id);

    if (updateError) {
      console.error("Failed to sync kick account:", updateError);
      return new Response(JSON.stringify({ error: "Sync failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Also update kick_subscribers table if they're a subscriber
    if (kick_data?.is_subscriber && kick_username) {
      const { data: existingSub } = await supabaseAdmin
        .from("kick_subscribers")
        .select("id")
        .eq("username", kick_username)
        .maybeSingle();

      if (!existingSub) {
        await supabaseAdmin
          .from("kick_subscribers")
          .insert({
            username: kick_username,
            subscription_tier: kick_data.subscription_tier || "Tier 1",
            subscription_type: "paid",
            subscribed_at: kick_data.subscribed_at || new Date().toISOString(),
          });
      }
    }

    console.log(`Synced Kick account: ${kick_username} (${kick_user_id})`);

    return new Response(
      JSON.stringify({ 
        success: true,
        synced: true,
        message: `Synced ${kick_username}`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Sync error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
