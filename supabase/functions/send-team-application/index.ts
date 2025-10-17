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

    // Input validation
    if (!fullName || fullName.length > 100) {
      throw new Error("Geçersiz ad");
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
    if (!emailRegex.test(recipientEmail)) {
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
          <p><strong>Full Name:</strong> ${escapeHtml(fullName)}</p>
          <p><strong>Age:</strong> ${escapeHtml(age)}</p>
          <p><strong>City:</strong> ${escapeHtml(city)}</p>
          <p><strong>Talent/Skill:</strong> ${escapeHtml(talent)}</p>
          <p><strong>Why they want to join:</strong></p>
          <p>${escapeHtml(reason)}</p>
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
    console.error("[Server Error] Team application:", error);
    return new Response(
      JSON.stringify({ error: "Başvuru gönderilemedi" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
