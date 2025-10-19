import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Chat = {
  id: string;
  user_name: string | null;
  status: "waiting" | "active" | "closed";
  mode: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  content: string;
  sender_type: "user" | "admin" | "ai";
  sender_name: string | null;
  created_at: string;
};

const AdminSupportChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();

    const channel = supabase
      .channel("admin-chats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_chats",
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);

      const channel = supabase
        .channel(`admin-messages-${selectedChat}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_messages",
            filter: `chat_id=eq.${selectedChat}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prev) => [...prev, newMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedChat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from("support_chats")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      return;
    }

    setChats(data || []);
  };

  const fetchMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
  };

  const acceptChat = async (chatId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("support_chats")
      .update({ status: "active", admin_id: user.id })
      .eq("id", chatId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept chat",
        variant: "destructive",
      });
      return;
    }

    setSelectedChat(chatId);
    toast({
      title: "Chat Accepted",
      description: "You can now respond to this chat",
    });
  };

  const closeChat = async (chatId: string) => {
    const { error } = await supabase
      .from("support_chats")
      .update({ status: "closed" })
      .eq("id", chatId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to close chat",
        variant: "destructive",
      });
      return;
    }

    if (selectedChat === chatId) {
      setSelectedChat(null);
      setMessages([]);
    }

    toast({
      title: "Chat Closed",
      description: "The chat has been closed",
    });
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedChat) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("support_messages").insert({
      chat_id: selectedChat,
      sender_type: "admin",
      sender_name: user.email?.split("@")[0] || "Admin",
      content: inputValue.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setInputValue("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary">Bekliyor</Badge>;
      case "active":
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/50">Aktif</Badge>;
      case "closed":
        return <Badge variant="outline">Kapalı</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Destek Sohbetleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
          {chats.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Henüz sohbet yok
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedChat === chat.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    {chat.user_name || "Anonim"}
                  </span>
                  {getStatusBadge(chat.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {chat.mode === "ai" ? "AI 🤖" : "İnsan 🧑‍💻"}
                  </Badge>
                  <span>{new Date(chat.created_at).toLocaleString("tr-TR")}</span>
                </div>
                {chat.status === "waiting" && (
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      acceptChat(chat.id);
                    }}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Kabul Et
                  </Button>
                )}
                {chat.status === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeChat(chat.id);
                    }}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Kapat
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Mesajlar</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedChat ? (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground">
              Bir sohbet seçin
            </div>
          ) : (
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-lg mb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_type === "admin" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.sender_type === "admin"
                          ? "bg-primary text-primary-foreground"
                          : msg.sender_type === "ai"
                          ? "bg-muted border border-border"
                          : "bg-secondary"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {msg.sender_type === "admin"
                          ? "Sen"
                          : msg.sender_type === "ai"
                          ? "AI"
                          : msg.sender_name || "Kullanıcı"}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Mesajınızı yazın..."
                />
                <Button onClick={sendMessage} disabled={!inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupportChats;
