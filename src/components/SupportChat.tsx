import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface Message {
  id: string;
  chat_id: string;
  sender_type: "user" | "ai";
  sender_name?: string;
  content: string;
  created_at: string;
}

interface SupportChatProps {
  chatId: string;
  userName?: string;
}

export default function SupportChat({ chatId, userName }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getUserName = () => userName || "Kullanıcı";

  // 🔹 Realtime listener
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel("support_messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_messages" },
        (payload) => {
          if (payload.new && payload.new.chat_id === chatId) {
            const newMessage = payload.new as Message;
            setMessages((prev) => {
              // Aynı ID'li mesaj zaten varsa tekrar ekleme
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // 🔹 Eski mesajları yükle
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return;
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      else setMessages(data as Message[]);
    };
    loadMessages();
  }, [chatId]);

  // 🔹 Scroll en alta
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Mesaj gönderme fonksiyonu
  const sendMessage = async () => {
    if (!inputValue.trim() || !chatId || isLoading) return;
    setIsLoading(true);

    try {
      const userMessage = {
        chat_id: chatId,
        sender_type: "user" as const,
        sender_name: getUserName(),
        content: inputValue.trim(),
      };

      // kullanıcı mesajını DB’ye ekle
      const { error } = await supabase.from("support_messages").insert(userMessage);
      if (error) throw error;

      setInputValue("");

      // AI yanıtını al (streaming)
      let aiResponse = "";
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-support-chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            message: userMessage.content,
          }),
        }
      );

      if (!response.ok) throw new Error("AI isteği başarısız.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // UI'da geçici "streaming" mesajı göster
      setMessages((prev) => [
        ...prev,
        {
          id: "streaming",
          chat_id: chatId,
          sender_type: "ai",
          content: "",
          created_at: new Date().toISOString(),
        },
      ]);

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
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === "streaming" ? { ...m, content: aiResponse } : m
                )
              );
            }
          } catch (err) {
            console.error("JSON parse hatası:", err);
          }
        }
      }

      // Stream bitti → yalnızca DB’ye yaz (UI'ya yeniden ekleme yok!)
      if (aiResponse) {
        await supabase.from("support_messages").insert({
          chat_id: chatId,
          sender_type: "ai",
          content: aiResponse,
        });

        // Placeholder'ı kaldır
        setMessages((prev) => prev.filter((m) => m.id !== "streaming"));
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken bir sorun oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111] text-white p-4 rounded-2xl border border-gray-800">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.sender_type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-2xl max-w-[80%] text-sm ${
                m.sender_type === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-100"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center space-x-2">
        <Input
          className="flex-1 bg-gray-900 border-gray-700 text-white"
          placeholder="Mesajınızı yazın..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!isLoading) sendMessage();
            }
          }}
        />
        <Button
          onClick={sendMessage}
          disabled={isLoading || !inputValue.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
