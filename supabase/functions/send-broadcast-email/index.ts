import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { subject, message, recipients }: BroadcastRequest = await req.json();

    if (!subject || !message || !recipients || recipients.length === 0) {
      throw new Error("Missing required fields");
    }

    // Send emails using Resend API
    const responses = [];
    for (const email of recipients) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "HadesOST <onboarding@resend.dev>",
          to: [email],
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7C3AED;">${subject}</h2>
              <div style="margin: 20px 0;">
                ${message.replace(/\n/g, "<br>")}
              </div>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                Bu e-postayı HadesOST'dan güncellemeler almak için abone olduğunuz için aldınız.
              </p>
            </div>
          `,
        }),
      });

      responses.push(res.ok);
    }

    const successCount = responses.filter(Boolean).length;

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: successCount,
        total: recipients.length,
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Broadcast error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
