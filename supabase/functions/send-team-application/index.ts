import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TeamApplicationRequest {
  fullName: string;
  age: string;
  city: string;
  talent: string;
  reason: string;
  recipientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, age, city, talent, reason, recipientEmail }: TeamApplicationRequest = await req.json();

    console.log("Sending team application email to:", recipientEmail);

    const emailResponse = await resend.emails.send({
      from: "HadesOST Team <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `New Team Application from ${fullName}`,
      html: `
        <h1>New Team Application</h1>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Age:</strong> ${age}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Talent/Skill:</strong> ${talent}</p>
        <p><strong>Why they want to join:</strong></p>
        <p>${reason}</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-team-application function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
