  const sendMessage = async () => {
    // 1) hızlı çıkış kontrolleri
    if (!inputValue.trim() || !chatId || isLoading) return;

    // 2) hemen loading durumunu aç
    setIsLoading(true);

    try {
      const userMessage = {
        chat_id: chatId,
        sender_type: "user" as const,
        sender_name: getUserName(),
        content: inputValue.trim(),
      };

      // kullanıcı mesajını ekle
      const { error } = await supabase.from("support_messages").insert(userMessage);

      if (error) {
        toast({
          title: "Error",
          description: "Mesaj gönderilemedi.",
          variant: "destructive",
        });
        return;
      }

      // inputu temizle (önlem: tekrar gönderilmemesi için)
      setInputValue("");

      // AI gateway'e isteği başlat
      setIsStreaming(true); // eğer stream için bir state varsa (ör: setIsStreaming) kullanın; yoksa atlayın
      let aiResponse = "";
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-support-chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chatId,
              message: userMessage.content,
              systemPrompt: SYSTEM_PROMPT, // eğer kullanıyorsanız
            }),
          }
        );

        if (!response.ok) throw new Error(`AI Gateway hatası: ${response.status}`);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });
          let newlineIndex: number;

          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                aiResponse += content;
                // realtime görsel güncelleme: ya son mesajı güncelle ya da yeni "streaming" göster
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.sender_type === "ai" && last.id === "streaming") {
                    return prev.map((m, i) =>
                      i === prev.length - 1 ? { ...m, content: aiResponse } : m
                    );
                  }
                  return [
                    ...prev,
                    {
                      id: "streaming",
                      content: aiResponse,
                      sender_type: "ai" as const,
                      created_at: new Date().toISOString(),
                    },
                  ];
                });
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }

        // stream bitti -> AI cevabını DB'ye kaydet
        if (aiResponse && chatId) {
          const { error: aiInsertError } = await supabase.from("support_messages").insert({
            chat_id: chatId,
            sender_type: "ai",
            content: aiResponse,
          });

          if (!aiInsertError) {
            // streaming placeholder'ın id'sini değiştirme (aynı öğeyi güncelleme)
            setMessages((prev) =>
              prev.map((m) =>
                m.id === "streaming" ? { ...m, id: Date.now().toString() } : m
              )
            );
          } else {
            console.error("AI mesajı DB'ye yazılamadı:", aiInsertError);
          }
        }
      } catch (streamErr) {
        console.error("AI streaming error:", streamErr);
        toast({
          title: "AI Hatası",
          description: "AI yanıtı alınırken hata oluştu.",
          variant: "destructive",
        });
      } finally {
        setIsStreaming(false); // eğer kullanıyorsanız
      }
    } catch (error) {
      console.error("sendMessage error:", error);
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken beklenmedik bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      // 3) her durumda loading'i kapat
      setIsLoading(false);
    }
  };
