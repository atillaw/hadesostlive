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
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Sohbete Katıl
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Sohbete katılmak için bir kullanıcı adı seç veya giriş yap
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Kullanıcı adı..."
              value={guestUsername}
              onChange={(e) => setGuestUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSetUsername()}
            />
            <Button onClick={handleSetUsername}>Devam Et</Button>
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            Veya Giriş Yap
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Meme Sohbet Odası
        </CardTitle>
        {isGuest && (
          <p className="text-sm text-muted-foreground">
            Misafir olarak katıldın: {guestUsername}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[400px] overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-lg">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-start gap-2 p-2 rounded bg-background"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {getDisplayName(msg)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm">{msg.message}</p>
              </div>
              {canDeleteMessage(msg) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMessage(msg.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Mesajını yaz..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemeChatRoom;