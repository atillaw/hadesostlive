import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting: 5 requests per hour per IP
const checkRateLimit = async (supabase: any, ipAddress: string): Promise<boolean> => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from("rate_limit_tracking")
    .select("*")
    .eq("ip_address", ipAddress)
    .eq("endpoint", "send-chat-notification")
    .gte("window_start", oneHourAgo.toISOString())
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Rate limit check error:", error);
    return true;
  }

  if (!data) {
    await supabase.from("rate_limit_tracking").insert({
      ip_address: ipAddress,
      endpoint: "send-chat-notification",
      request_count: 1,
      window_start: new Date().toISOString(),
    });
    return true;
  }

  if (data.request_count >= 5) {
    return false;
  }

  await supabase
    .from("rate_limit_tracking")
    .update({ request_count: data.request_count + 1 })
    .eq("id", data.id);

  return true;
};

const logSecurityEvent = async (
  supabase: any,
  eventType: string,
  severity: string,
  ipAddress: string,
  userAgent: string,
  details: any
) => {
  await supabase.from("security_logs").insert({
    event_type: eventType,
    severity,
    ip_address: ipAddress,
    user_agent: userAgent,
    endpoint: "send-chat-notification",
    details,
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    // Rate limiting check
    const allowed = await checkRateLimit(supabase, ipAddress);
    if (!allowed) {
      await logSecurityEvent(
        supabase,
        "rate_limit_exceeded",
        "warning",
        ipAddress,
        userAgent,
        { endpoint: "send-chat-notification" }
      );

      return new Response(
        JSON.stringify({ error: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { chatId, userName } = await req.json();
    
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Servis şu anda kullanılamıyor" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    
    await resend.emails.send({
      from: "Hadesost Support <onboarding@resend.dev>",
      to: ["hadesost@gmail.com"],
      subject: "🔔 Yeni Destek Talebi",
      html: `
        <h2>Yeni Destek Talebi</h2>
        <p><strong>Kullanıcı:</strong> ${userName || "Anonim"}</p>
        <p><strong>Chat ID:</strong> ${chatId}</p>
        <p><strong>Zaman:</strong> ${new Date().toLocaleString("tr-TR")}</p>
        <br>
        <p>Lütfen admin panelinden bu sohbete yanıt verin.</p>
      `,
    });

    await logSecurityEvent(
      supabase,
      "chat_notification_sent",
      "info",
      ipAddress,
      userAgent,
      { chatId, userName }
    );

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Email notification error:", error);

    await logSecurityEvent(
      supabase,
      "chat_notification_error",
      "warning",
      ipAddress,
      userAgent,
      { error: error.message }
    );

    return new Response(
      JSON.stringify({ error: "Bildirim gönderilemedi" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
