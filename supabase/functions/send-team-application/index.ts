import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    // Using Resend API directly
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
      }),
    });

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
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
