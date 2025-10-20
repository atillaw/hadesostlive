import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant" | "admin";
  content: string;
  created_at?: string;
}

type ChatMode = "select" | "ai" | "human";

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("select");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [supportChatId, setSupportChatId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a unique session ID for this user
  const sessionId = useRef(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && chatMode === "ai" && !conversationId) {
      initAIConversation();
    } else if (isOpen && chatMode === "human" && !supportChatId && userName) {
      initHumanChat();
    }
  }, [isOpen, chatMode, userName]);

  useEffect(() => {
    if (supportChatId) {
      subscribeToMessages();
    }
  }, [supportChatId]);

  const initAIConversation = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_chat_conversations")
        .insert({ user_session_id: sessionId.current })
        .select()
        .single();

      if (error) throw error;
      setConversationId(data.id);

      const welcomeMessage = {
        role: "assistant" as const,
        content: "Merhaba! Size nasıl yardımcı olabilirim? Genel sorularınızı yanıtlayabilirim veya Atakan/Hadesost hakkında bilgi verebilirim.",
      };
      setMessages([welcomeMessage]);

      await supabase.from("ai_chat_messages").insert({
        conversation_id: data.id,
        role: "assistant",
        content: welcomeMessage.content,
      });
    } catch (error) {
      console.error("Error initializing AI conversation:", error);
      toast.error("AI sohbet başlatılamadı");
    }
  };

  const initHumanChat = async () => {
    try {
      const { data, error } = await supabase
        .from("support_chats")
        .insert({
          user_identifier: sessionId.current,
          user_name: userName,
          mode: "human",
        })
        .select()
        .single();

      if (error) throw error;
      setSupportChatId(data.id);

      const welcomeMessage = {
        role: "assistant" as const,
        content: "Merhaba! Bir admin sizinle en kısa sürede ilgilenecektir. Lütfen bekleyin.",
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Error initializing human chat:", error);
      toast.error("İnsan destek sohbeti başlatılamadı");
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`support_messages_${supportChatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `chat_id=eq.${supportChatId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          setMessages((prev) => [
            ...prev,
            {
              role: newMessage.sender_type === "admin" ? "admin" : "user",
              content: newMessage.content,
              created_at: newMessage.created_at,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendAIMessage = async () => {
    if (!input.trim() || !conversationId || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await supabase.from("ai_chat_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: userMessage.content,
      });

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [...messages, userMessage],
          conversationId,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from("ai_chat_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantMessage.content,
      });
    } catch (error) {
      console.error("Error sending AI message:", error);
      toast.error("Mesaj gönderilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const sendHumanMessage = async () => {
    if (!input.trim() || !supportChatId) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      await supabase.from("support_messages").insert({
        chat_id: supportChatId,
        sender_type: "user",
        sender_name: userName,
        content: userMessage.content,
      });
    } catch (error) {
      console.error("Error sending human message:", error);
      toast.error("Mesaj gönderilemedi");
    }
  };

  const handleModeSelect = (mode: "ai" | "human") => {
    setChatMode(mode);
    if (mode === "human" && !userName) {
      // Kullanıcı adı isteyeceğiz
      return;
    }
  };

  const handleNameSubmit = () => {
    if (userName.trim()) {
      initHumanChat();
    }
  };

  const renderModeSelection = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
      <h3 className="text-lg font-semibold text-center">
        Nasıl yardımcı olabiliriz?
      </h3>
      <div className="space-y-3 w-full">
        <Button
          onClick={() => handleModeSelect("ai")}
          className="w-full h-20 flex flex-col gap-2"
          variant="outline"
        >
          <Bot className="h-6 w-6" />
          <span>AI Asistan</span>
        </Button>
        <Button
          onClick={() => handleModeSelect("human")}
          className="w-full h-20 flex flex-col gap-2"
          variant="outline"
        >
          <User className="h-6 w-6" />
          <span>İnsan Destek</span>
        </Button>
      </div>
    </div>
  );

  const renderNameInput = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
      <h3 className="text-lg font-semibold text-center">
        Lütfen adınızı girin
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNameSubmit();
        }}
        className="w-full space-y-3"
      >
        <Input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Adınız..."
          autoFocus
        />
        <Button type="submit" className="w-full" disabled={!userName.trim()}>
          Başlat
        </Button>
      </form>
      <Button
        variant="ghost"
        onClick={() => setChatMode("select")}
        className="w-full"
      >
        Geri
      </Button>
    </div>
  );

  const renderChat = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && chatMode === "ai" && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            chatMode === "ai" ? sendAIMessage() : sendHumanMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mesajınızı yazın..."
            disabled={chatMode === "ai" && isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={chatMode === "ai" && isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-96 h-[500px] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">
                {chatMode === "select"
                  ? "Destek"
                  : chatMode === "ai"
                  ? "AI Asistan"
                  : "İnsan Destek"}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setChatMode("select");
                setMessages([]);
                setConversationId(null);
                setSupportChatId(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {chatMode === "select" && renderModeSelection()}
          {chatMode === "human" && !supportChatId && renderNameInput()}
          {((chatMode === "ai" && conversationId) ||
            (chatMode === "human" && supportChatId)) &&
            renderChat()}
        </Card>
      )}
    </div>
  );
};

export default AIChatWidget;