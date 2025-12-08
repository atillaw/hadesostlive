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

    const { users } = await req.json();

    if (!Array.isArray(users)) {
      return new Response(JSON.stringify({ error: "users array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRole);

    let synced = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const { kick_user_id, kick_username, kick_data } = user;

        if (!kick_user_id) continue;

        const { data: kickAccount } = await supabaseAdmin
          .from("kick_accounts")
          .select("id")
          .eq("kick_user_id", kick_user_id)
          .maybeSingle();

        if (!kickAccount) {
          failed++;
          continue;
        }

        const updateData: Record<string, unknown> = {
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (kick_username) updateData.kick_username = kick_username;
        if (kick_data?.kick_display_name) updateData.kick_display_name = kick_data.kick_display_name;
        if (kick_data?.kick_avatar_url) updateData.kick_avatar_url = kick_data.kick_avatar_url;
        if (typeof kick_data?.is_follower === "boolean") updateData.is_follower = kick_data.is_follower;
        if (typeof kick_data?.is_subscriber === "boolean") updateData.is_subscriber = kick_data.is_subscriber;
        if (kick_data?.subscription_tier) updateData.subscription_tier = kick_data.subscription_tier;
        if (typeof kick_data?.subscription_months === "number") updateData.subscription_months = kick_data.subscription_months;
        if (typeof kick_data?.is_moderator === "boolean") updateData.is_moderator = kick_data.is_moderator;
        if (typeof kick_data?.is_vip === "boolean") updateData.is_vip = kick_data.is_vip;
        if (typeof kick_data?.is_og === "boolean") updateData.is_og = kick_data.is_og;
        if (typeof kick_data?.is_founder === "boolean") updateData.is_founder = kick_data.is_founder;
        if (kick_data?.badges) updateData.badges = kick_data.badges;

        const { error } = await supabaseAdmin
          .from("kick_accounts")
          .update(updateData)
          .eq("id", kickAccount.id);

        if (error) {
          failed++;
        } else {
          synced++;
        }
      } catch {
        failed++;
      }
    }

    console.log(`Bulk sync completed: ${synced} synced, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        synced,
        failed,
        total: users.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Bulk sync error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
