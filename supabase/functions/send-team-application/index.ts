import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TeamApplicationRequest {
  fullName: string;
  email: string;
  instagram?: string;
  discord?: string;
  age: string;
  city: string;
  talent: string;
  reason: string;
  recipientEmail: string;
}

// Rate limiting: 3 requests per hour per IP
const checkRateLimit = async (supabase: any, ipAddress: string): Promise<boolean> => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from("rate_limit_tracking")
    .select("*")
    .eq("ip_address", ipAddress)
    .eq("endpoint", "send-team-application")
    .gte("window_start", oneHourAgo.toISOString())
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Rate limit check error:", error);
    return true; // Allow on error
  }

  if (!data) {
    // First request in this window
    await supabase.from("rate_limit_tracking").insert({
      ip_address: ipAddress,
      endpoint: "send-team-application",
      request_count: 1,
      window_start: new Date().toISOString(),
    });
    return true;
  }

  if (data.request_count >= 3) {
    return false; // Rate limit exceeded
  }

  // Increment counter
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
    endpoint: "send-team-application",
    details,
  });
};

const handler = async (req: Request): Promise<Response> => {
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
        { endpoint: "send-team-application" }
      );

      return new Response(
        JSON.stringify({ error: "Çok fazla istek gönderdiniz. Lütfen bir saat sonra tekrar deneyin." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { fullName, email, instagram, discord, age, city, talent, reason, recipientEmail }: TeamApplicationRequest = await req.json();

    // Input validation
    if (!fullName || fullName.length > 100) {
      throw new Error("Geçersiz ad");
    }
    if (!email || email.length > 100) {
      throw new Error("Geçersiz e-posta");
    }
    if (!age || age.length > 3) {
      throw new Error("Geçersiz yaş");
    }
    if (!city || city.length > 100) {
      throw new Error("Geçersiz şehir");
    }
    if (!talent || talent.length > 200) {
      throw new Error("Geçersiz yetenek");
    }
    if (!reason || reason.length > 2000) {
      throw new Error("Geçersiz açıklama");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail) || !emailRegex.test(email)) {
      throw new Error("Geçersiz e-posta adresi");
    }

    // Escape HTML to prevent XSS
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    console.log("Sending team application email to:", recipientEmail);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HadesOST Team <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `Yeni Takım Başvurusu - ${fullName}`,
        html: `
          <h1>Yeni Takım Başvurusu</h1>
          <p><strong>İsim:</strong> ${escapeHtml(fullName)}</p>
          <p><strong>E-posta:</strong> ${escapeHtml(email)}</p>
          ${instagram ? `<p><strong>Instagram:</strong> ${escapeHtml(instagram)}</p>` : ""}
          ${discord ? `<p><strong>Discord:</strong> ${escapeHtml(discord)}</p>` : ""}
          <p><strong>Yaş:</strong> ${escapeHtml(age)}</p>
          <p><strong>Şehir:</strong> ${escapeHtml(city)}</p>
          <p><strong>Yetenek/Beceri:</strong> ${escapeHtml(talent)}</p>
          <p><strong>Katılma Nedeni:</strong></p>
          <p>${escapeHtml(reason)}</p>
        `,
      }),
    });

    const data = await emailResponse.json();

    await logSecurityEvent(
      supabase,
      "team_application_submitted",
      "info",
      ipAddress,
      userAgent,
      { fullName, email, success: emailResponse.ok }
    );

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[Server Error] Team application:", error);

    await logSecurityEvent(
      supabase,
      "team_application_error",
      "warning",
      ipAddress,
      userAgent,
      { error: error.message }
    );

    return new Response(
      JSON.stringify({ error: "Bir hata oluştu. Lütfen tekrar deneyin." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
