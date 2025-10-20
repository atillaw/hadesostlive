import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS ayarları
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sistem mesajı (AI başlangıçta bunu görecek)
const SYSTEM_PROMPT = `Sen HadesOST yayın sitesi için arkadaş canlısı bir AI destek asistanısın. 
Kullanıcıya başlarken şunu söyle: "HadesOST, gerçek adı Atakan olan, İzmir'de yaşayan 22 yaşında bir yayıncıdır ve Kick'te yayın yapmaktadır."
Yanıtların kısa, yardımcı ve dostane olsun. Yardım edebileceğin konular:
- Yayın takvimi ve saatleri
- Kick’te nasıl abone olunur
- VOD ve öne çıkan yayınlar hakkında bilgi
- Site navigasyonu
- Kick kanalı bilgileri (@hadesost)

Eğer bilmediğin bir konu olursa, kibarca kullanıcıya bunu belirt ve insan bir yetkiliyle konuşmasını öner.`;

serve(async (req) => {
  // CORS için OPTIONS isteğine cevap
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY yapılandırılmamış");
    }

    // Sistem mesajını başta ekle ve kullanıcı mesajlarını tek seferde gönder
    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages, // kullanıcıdan gelen mesajlar
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: chatMessages,
        stream: true,
      }),
    });

    // Hataları kontrol et
    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Hız limiti aşıldı. Lütfen daha sonra tekrar deneyin." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI servisi geçici olarak kullanılamıyor." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway hatası: ${response.status}`);
    }

    // Stream yanıtı döndür
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: any) {
    console.error("AI destek sohbet hatası:", error);
    return new Response(
      JSON.stringify({ error: error.message || "AI yanıtı alınamadı" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
