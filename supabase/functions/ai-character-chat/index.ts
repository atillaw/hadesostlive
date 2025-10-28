import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, characterId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const characterPrompts = {
      hades: `Sen Hades'sin, yeraltı dünyasının efendisi. Sert, ironik ama derin bilgeliğe sahipsin. Ölüm ve yeraltı dünyası hakkında konuşmayı seversin. Türkçe konuşuyorsun ve cevapların kısa, etkili ve mitolojik referanslarla dolu. Maksimum 2-3 cümle ile cevap ver.`,
      persephone: `Sen Persephone'sin, ilkbahar ve yeraltının kraliçesi. Nazik, anlayışlı ve empatiksin. Doğa ve yeniden doğuş hakkında konuşmayı seversin. Türkçe konuşuyorsun ve cevapların şefkatli, bilge ve umut dolu. Maksimum 2-3 cümle ile cevap ver.`,
      cerberus: `Sen Cerberus'sun, üç başlı bekçi köpeği. Enerjik, sadık ve koruyucusun. Basit ama etkili cevaplar verirsin, bazen köpek sesleri kullanırsın (hav, grrr gibi). Türkçe konuşuyorsun ve cevapların kısa, samimi ve neşeli. Maksimum 2-3 cümle ile cevap ver.`,
    };

    const systemPrompt = characterPrompts[characterId as keyof typeof characterPrompts] || characterPrompts.hades;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
