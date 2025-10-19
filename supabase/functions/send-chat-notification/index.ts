import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatId, userName } = await req.json();
    
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    
    await resend.emails.send({
      from: "Hadesost Support <onboarding@resend.dev>",
      to: ["hadesost@gmail.com"], // Admin email
      subject: "🔔 New Support Chat Request",
      html: `
        <h2>New Support Chat Request</h2>
        <p><strong>User:</strong> ${userName || "Anonymous"}</p>
        <p><strong>Chat ID:</strong> ${chatId}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <br>
        <p>Please log in to the admin dashboard to respond to this chat request.</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Email notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
