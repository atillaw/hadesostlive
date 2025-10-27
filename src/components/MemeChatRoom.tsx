import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  user_id: string | null;
  guest_username: string | null;
  message: string;
  created_at: string;
}

const MemeChatRoom = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [guestUsername, setGuestUsername] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasSetUsername, setHasSetUsername] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Profanity filter - Turkish curse words
  const profanityList = [
    'amk', 'amına', 'amq', 'aq', 'orospu', 'oç', 'piç', 'sik', 'yarrak', 
    'göt', 'am', 'siktir', 'bok', 'kahpe', 'pezevenk', 'ibne', 'puşt',
    'dalyarak', 'salak', 'aptal', 'gerizekalı', 'mal', 'manyak', 'dangalak',
    'amcık', 'amcik', 'taşak', 'tasak', 'yarak', 'götveren', 'sikik'
  ];

  const censorMessage = (text: string): string => {
    let censored = text;
    profanityList.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      censored = censored.replace(regex, '***');
    });
    return censored;
  };

  useEffect(() => {
    checkUser();
    fetchMessages();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    if (!user) {
      setIsGuest(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('meme_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('meme-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meme_chat_messages'
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'meme_chat_messages'
        },
        (payload) => {
          setMessages(prev => prev.filter(msg => msg.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (isGuest && !hasSetUsername) {
      toast.error("Lütfen kullanıcı adı girin");
      return;
    }

    const censoredMessage = censorMessage(newMessage);

    try {
      const messageData: any = {
        message: censoredMessage,
        created_at: new Date().toISOString()
      };

      if (currentUser) {
        messageData.user_id = currentUser.id;
      } else {
        messageData.guest_username = guestUsername;
      }

      const { error } = await supabase
        .from('meme_chat_messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error("Mesaj gönderilemedi");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('meme_chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      toast.success("Mesaj silindi");
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast.error("Mesaj silinemedi");
    }
  };

  const handleSetUsername = () => {
    if (!guestUsername.trim()) {
      toast.error("Geçerli bir kullanıcı adı girin");
      return;
    }
    setHasSetUsername(true);
    toast.success(`Hoş geldin, ${guestUsername}!`);
  };

  const getDisplayName = (msg: ChatMessage): string => {
    if (msg.guest_username) return msg.guest_username;
    if (msg.user_id) return "Üye";
    return "Anonim";
  };

  const canDeleteMessage = (msg: ChatMessage): boolean => {
    if (currentUser?.id === msg.user_id) return true;
    if (!currentUser && msg.guest_username === guestUsername) return true;
    return false;
  };

  if (isGuest && !hasSetUsername) {
    return (
      <Card className="w-full max-w-2xl mx-auto card-glow bg-card/50 backdrop-blur-sm animate-scale-in">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageCircle className="h-6 w-6 text-primary" />
            Sohbete Katıl
          </CardTitle>
          <p className="text-muted-foreground">
            Sohbete katılmak için bir kullanıcı adı seç veya giriş yap
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Kullanıcı adı..."
              value={guestUsername}
              onChange={(e) => setGuestUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()}
              className="text-base"
            />
            <Button 
              onClick={handleSetUsername}
              className="hover:scale-105 transition-transform"
            >
              Devam Et
            </Button>
          </div>
          <Button 
            variant="outline" 
            className="w-full hover:scale-105 transition-transform"
            onClick={() => navigate("/auth")}
          >
            Veya Giriş Yap
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto card-glow bg-card/50 backdrop-blur-sm animate-fade-in">
      <CardHeader className="border-b border-border/50 bg-card/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl mb-2">
              <MessageCircle className="h-6 w-6 text-primary animate-pulse" />
              Sohbet Odası
            </CardTitle>
            {isGuest && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Misafir: <span className="font-medium text-foreground">{guestUsername}</span>
              </p>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {messages.length} mesaj
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] overflow-y-auto space-y-2 p-4 bg-gradient-to-b from-muted/20 to-transparent">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Henüz mesaj yok. İlk mesajı sen gönder! 💬</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.01}s` }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {getDisplayName(msg).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">
                      {getDisplayName(msg)}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
                {canDeleteMessage(msg) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="flex-shrink-0 h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur">
          <div className="flex gap-2">
            <Input
              placeholder="Mesajını yaz..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="text-base"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="hover:scale-105 transition-transform"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ℹ️ Küfür ve hakaret otomatik olarak filtrelenir
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemeChatRoom;