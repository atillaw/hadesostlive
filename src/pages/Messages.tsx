import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  other_user: {
    id: string;
    username: string;
  };
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_username: string;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(user.id);
    fetchConversations(user.id);
  };

  const fetchConversations = async (userId: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return;
    }

    const conversationsWithUsers = await Promise.all(
      (data || []).map(async (conv) => {
        const otherUserId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, username")
          .eq("id", otherUserId)
          .single();

        return {
          ...conv,
          other_user: profile || { id: otherUserId, username: "Unknown" },
        };
      })
    );

    setConversations(conversationsWithUsers);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    const messagesWithUsernames = await Promise.all(
      (data || []).map(async (msg) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", msg.sender_id)
          .single();

        return {
          ...msg,
          sender_username: profile?.username || "Unknown",
        };
      })
    );

    setMessages(messagesWithUsernames);

    // Mark messages as read
    await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", currentUserId);
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);

      const channel = supabase
        .channel(`messages:${selectedConversation}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "direct_messages",
            filter: `conversation_id=eq.${selectedConversation}`,
          },
          () => {
            fetchMessages(selectedConversation);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const { error } = await supabase.from("direct_messages").insert({
      conversation_id: selectedConversation,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
    fetchMessages(selectedConversation);
  };

  const selectedConvData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mesajlar</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
          {/* Conversations List */}
          <div className="border rounded-lg p-4 bg-card">
            <h2 className="font-semibold mb-4">Konuşmalar</h2>
            <ScrollArea className="h-[520px]">
              {conversations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Henüz mesajınız yok</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation === conv.id ? "bg-muted" : ""
                    }`}
                  >
                    <Avatar>
                      <AvatarFallback>
                        {conv.other_user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conv.other_user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv.last_message_at
                          ? new Date(conv.last_message_at).toLocaleDateString("tr-TR")
                          : "Mesaj yok"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="md:col-span-2 border rounded-lg flex flex-col bg-card">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedConvData?.other_user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedConvData?.other_user.username}</p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-4 flex ${
                        msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender_id === currentUserId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-xs opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={sendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Bir konuşma seçin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
