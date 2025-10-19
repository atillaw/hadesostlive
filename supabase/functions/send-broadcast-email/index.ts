import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BroadcastRequest {
  subject: string;
  message: string;
  recipients: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Yetkilendirme gerekli" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userAuthError } = await supabaseAdmin.auth.getUser(token);
    
    if (userAuthError || !user) {
      return new Response(
        JSON.stringify({ error: "Geçersiz kimlik doğrulama" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 401 }
      );
    }

    // Check if user is admin
    const { data: roleData, error: checkRoleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (checkRoleError || !roleData) {
      console.error("[Auth Error] Not admin:", checkRoleError);
      return new Response(
        JSON.stringify({ error: "Yalnızca yöneticiler toplu e-posta gönderebilir" }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 403 }
      );
    }

    const { subject, message, recipients }: BroadcastRequest = await req.json();

    // Input validation
    if (!subject || subject.length === 0 || subject.length > 200) {
      throw new Error("Konu 1-200 karakter arasında olmalıdır");
    }

    if (!message || message.length === 0 || message.length > 5000) {
      throw new Error("Mesaj 1-5000 karakter arasında olmalıdır");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        throw new Error("Geçersiz e-posta adresi tespit edildi");
      }
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

    if (!subject || !message || !recipients || recipients.length === 0) {
      throw new Error("Missing required fields");
    }

    // Send emails using Resend API
    console.log(`Sending broadcast to ${recipients.length} recipients`);
    
    const responses = [];
    const errors = [];
    
    for (const email of recipients) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "HadesOST <onboarding@resend.dev>",
            to: [email],
            subject: escapeHtml(subject),
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7C3AED;">${escapeHtml(subject)}</h2>
                <div style="margin: 20px 0;">
                  ${escapeHtml(message).replace(/\n/g, "<br>")}
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                  Bu e-postayı HadesOST'dan güncellemeler almak için abone olduğunuz için aldınız.
                </p>
              </div>
            `,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error(`[Resend Error] Failed to send to ${email}:`, errorData);
          errors.push({ email, error: errorData });
          responses.push(false);
        } else {
          const data = await res.json();
          console.log(`[Resend Success] Sent to ${email}:`, data);
          responses.push(true);
        }
      } catch (error: any) {
        console.error(`[Network Error] Failed to send to ${email}:`, error);
        errors.push({ email, error: error?.message || String(error) });
        responses.push(false);
      }
    }

    const successCount = responses.filter(Boolean).length;
    
    console.log(`[Broadcast Result] Sent ${successCount}/${recipients.length} emails`);
    
    if (errors.length > 0) {
      console.error("[Broadcast Errors]:", errors);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: successCount,
        total: recipients.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[Server Error] Broadcast:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "E-posta gönderimi başarısız oldu",
        details: error.toString()
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
