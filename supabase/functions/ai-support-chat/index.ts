import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sistem mesajı
const SYSTEM_PROMPT = `Sen HadesOST yayın sitesi için arkadaş canlısı bir AI destek asistanısın. 
Yanıtların kısa, yardımcı ve dostane olsun. Yardım edebileceğin konular:
- Yayın takvimi ve saatleri
- Kick’te nasıl abone olunur
- VOD ve öne çıkan yayınlar hakkında bilgi
- Site navigasyonu
- Kick kanalı bilgileri (@hadesost)

Eğer bilmediğin bir konu olursa, kibarca kullanıcıya bunu belirt ve insan bir yetkiliyle konuşmasını öner.`;

// Hoş geldin mesajı (sadece ilk açılışta gönderilecek)
const WELCOME_MESSAGE = { role: "system", content: "Hoş geldin! HadesOST, gerçek adı Atakan olan, İzmir'de yaşayan 22 yaşında bir yayıncıdır ve Kick'te yayın yapmaktadır." };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, firstOpen } = await req.json(); 
    // firstOpen: client tarafından gönderilen, sohbetin ilk açılışı olduğunu belirten flag

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY yapılandırılmamış");
    }

    // Mesaj dizisini oluştur
    const chatMessages = [ { role: "system", content: SYSTEM_PROMPT } ];

    // Eğer sohbet ilk açılıyorsa hoş geldin mesajını ekle
    if (firstOpen) {
      chatMessages.push(WELCOME_MESSAGE);
    }

    // Kullanıcı mesajlarını ekle
    if (Array.isArray(messages)) {
      chatMessages.push(...messages);
    }

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
