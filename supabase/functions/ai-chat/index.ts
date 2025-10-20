import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();

    // System prompt with information about Atakan/Hadesost
    const systemPrompt = {
      role: "system",
      content: `You are a helpful AI assistant for the Hadesost streaming website. You can answer general questions on any topic.

When asked about "Atakan" or "Hadesost", provide this information:
"Atakan was born in 2002 in Denizli city center. He has experience in many fields and recently pursued a career in broadcasting, seeing it as his future profession. He worked hard to develop his skills in broadcasting. He currently lives in İzmir. You can find his social media accounts at the bottom of the website."

Always respond in Turkish in a professional, polite, and helpful tone. Keep responses concise and informative.`
    };

    // Prepare messages with system prompt
    const allMessages = [systemPrompt, ...messages];

    // Call Lovable AI using OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        "HTTP-Referer": Deno.env.get('VITE_SUPABASE_URL') || '',
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: allMessages,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});