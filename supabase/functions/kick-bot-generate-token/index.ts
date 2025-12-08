import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bot-secret",
};

// Generate cryptographically secure token
function generateSecureToken(): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Readable characters (no 0, O, 1, I)
  const randomValues = new Uint8Array(8);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((v) => charset[v % charset.length])
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify bot secret
    const botSecret = req.headers.get("x-bot-secret");
    const expectedSecret = Deno.env.get("KICK_BOT_SECRET");
    
    if (!botSecret || botSecret !== expectedSecret) {
      console.log("Invalid bot secret");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { 
      kick_user_id, 
      kick_username, 
      kick_display_name,
      kick_avatar_url,
      kick_channel_slug,
      kick_data // All additional Kick data (badges, sub status, etc.)
    } = await req.json();

    if (!kick_user_id || !kick_username) {
      return new Response(JSON.stringify({ error: "kick_user_id and kick_username are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRole);

    // Clean up expired tokens first
    await supabaseAdmin.rpc('cleanup_expired_kick_tokens');

    // Check if user already has a valid pending token
    const { data: existingToken } = await supabaseAdmin
      .from("kick_connect_tokens")
      .select("token, expires_at")
      .eq("kick_user_id", kick_user_id)
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingToken) {
      // Return existing valid token
      const expiresIn = Math.floor((new Date(existingToken.expires_at).getTime() - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ 
          token: existingToken.token,
          expires_in: expiresIn,
          message: `Mevcut token: ${existingToken.token} - ${expiresIn} saniye içinde geçerliliğini yitirecek.`
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate new token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Insert new token
    const { error: insertError } = await supabaseAdmin
      .from("kick_connect_tokens")
      .insert({
        kick_user_id,
        kick_username,
        kick_display_name: kick_display_name || kick_username,
        kick_avatar_url,
        kick_channel_slug,
        token,
        expires_at: expiresAt.toISOString(),
        kick_data: kick_data || {},
      });

    if (insertError) {
      console.error("Failed to insert token:", insertError);
      return new Response(JSON.stringify({ error: "Failed to generate token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generated token for Kick user: ${kick_username} (${kick_user_id})`);

    return new Response(
      JSON.stringify({ 
        token,
        expires_in: 600,
        message: `Token: ${token} - 10 dakika içinde hadesost.uk/kullanici-ayarlari adresine gidip bu kodu gir!`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Token generation error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
