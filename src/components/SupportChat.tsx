import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type ChatMode = "ai" | "human" | null;
type Message = {
  id: string;
  content: string;
  sender_type: "user" | "admin" | "ai";
  sender_name?: string;
  created_at: string;
};

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getUserIdentifier = () => {
    let userId = localStorage.getItem("support_user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("support_user_id", userId);
    }
    return userId;
  };

  const getUserName = () => {
    return localStorage.getItem("support_user_name") || "Anonymous";
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`support-chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_type !== "user") {
            setMessages((prev) => [...prev, newMessage]);
            setIsTyping(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const startChat = async (selectedMode: ChatMode) => {
    if (!selectedMode) return;

    setMode(selectedMode);
    const userIdentifier = getUserIdentifier();
    const userName = getUserName();

    const { data, error } = await supabase
      .from("support_chats")
      .insert({
        user_identifier: userIdentifier,
        user_name: userName,
        mode: selectedMode,
        status: selectedMode === "human" ? "waiting" : "active",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      });
      return;
    }

    setChatId(data.id);

    if (selectedMode === "human") {
      await supabase.functions.invoke("send-chat-notification", {
        body: { chatId: data.id, userName },
      });

      setMessages([
        {
          id: "welcome",
          content: "Bir admin ile bağlantı kuruluyor. Lütfen bekleyin...",
          sender_type: "ai",
          created_at: new Date().toISOString(),
        },
      ]);
    } else {
      setMessages([
        {
          id: "welcome",
          content: "Merhaba! Size nasıl yardımcı olabilirim?",
          sender_type: "ai",
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !chatId || isLoading) return;

    const userMessage = {
      chat_id: chatId,
      sender_type: "user" as const,
      sender_name: getUserName(),
      content: inputValue.trim(),
    };

    const { error } = await supabase.from("support_messages").insert(userMessage);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setMessages((prev) => [
      ...prev,
      { ...userMessage, id: Date.now().toString(), created_at: new Date().toISOString() },
    ]);
    setInputValue("");

    if (mode === "ai") {
      setIsLoading(true);
      setIsTyping(true);
      await streamAIResponse(inputValue);
    } else {
      setIsTyping(true);
    }
  };

  const streamAIResponse = async (userInput: string) => {
    try {
      const conversationMessages = messages.map((msg) => ({
        role: msg.sender_type === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      conversationMessages.push({ role: "user", content: userInput });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-support-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ messages: conversationMessages }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to get AI response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
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

      if (aiResponse && chatId) {
        const { error } = await supabase.from("support_messages").insert({
          chat_id: chatId,
          sender_type: "ai",
          content: aiResponse,
        });

        if (!error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === "streaming" ? { ...m, id: Date.now().toString() } : m
            )
          );
        }
      }
    } catch (error) {
      console.error("AI streaming error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setMode(null);
    setMessages([]);
    setChatId(null);
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] z-50 flex flex-col shadow-2xl border-border">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-semibold">Canlı Destek</span>
              {mode && (
                <Badge variant="secondary" className="text-xs">
                  {mode === "ai" ? "AI 🤖" : "İnsan 🧑‍💻"}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={closeChat}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!mode ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              <h3 className="text-lg font-semibold text-center mb-2">
                Destek türünü seçin
              </h3>
              <Button
                onClick={() => startChat("ai")}
                className="w-full h-20 flex flex-col gap-2"
                variant="outline"
              >
                <Bot className="h-8 w-8" />
                <span>AI Asistan ile Sohbet 🤖</span>
              </Button>
              <Button
                onClick={() => startChat("human")}
                className="w-full h-20 flex flex-col gap-2"
                variant="outline"
              >
                <UserIcon className="h-8 w-8" />
                <span>İnsan ile Sohbet 🧑‍💻</span>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.sender_type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Mesajınızı yazın..."
                    disabled={isLoading}
                  />
                  <Button onClick={sendMessage} disabled={isLoading || !inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default SupportChat;
