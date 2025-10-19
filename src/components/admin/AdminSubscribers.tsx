import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Hata",
        description: "Aboneler yüklenemedi.",
        variant: "destructive",
      });
    } else {
      setSubscribers(data || []);
    }
    setLoading(false);
  };

  const handleSendBroadcast = async () => {
    if (!subject || !message) {
      toast({
        title: "Hata",
        description: "Lütfen konu ve mesaj girin.",
        variant: "destructive",
      });
      return;
    }

    const activeSubscribers = subscribers.filter(s => s.is_active);
    
    if (activeSubscribers.length === 0) {
      toast({
        title: "Hata",
        description: "Aktif abone bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`${activeSubscribers.length} aboneye e-posta göndermek istediğinizden emin misiniz?`)) {
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-broadcast-email", {
        body: {
          subject,
          message,
          recipients: activeSubscribers.map(s => s.email),
        },
      });

      if (error) throw error;

      // Check if there were any errors in the response
      if (data?.errors && data.errors.length > 0) {
        toast({
          title: "Kısmi Başarı",
          description: `${data.sent}/${data.total} e-posta gönderildi. Bazı hatalar oluştu.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Gönderildi!",
          description: `${data?.sent || activeSubscribers.length} aboneye e-posta gönderildi.`,
        });
      }

      setSubject("");
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "E-posta gönderilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("email_subscribers")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Hata",
        description: "Durum değiştirilemedi.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Güncellendi",
        description: "Abone durumu değiştirildi.",
      });
      loadSubscribers();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu aboneyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    const { error } = await supabase
      .from("email_subscribers")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Hata",
        description: "Abone silinemedi.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Silindi",
        description: "Abone başarıyla silindi.",
      });
      loadSubscribers();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  const activeCount = subscribers.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Toplu E-posta Gönder
        </h2>
        <p className="text-muted-foreground mb-6">
          Toplam {activeCount} aktif aboneye mesaj gönder
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Konu</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Örn: Yeni Yayın Başladı!"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mesaj</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mesajınızı buraya yazın..."
              rows={6}
            />
          </div>

          <Button
            onClick={handleSendBroadcast}
            disabled={sending || activeCount === 0}
            className="w-full"
          >
            {sending ? "Gönderiliyor..." : `${activeCount} Aboneye Gönder`}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Aboneler</h2>
            <p className="text-muted-foreground">
              Toplam {subscribers.length} abone ({activeCount} aktif)
            </p>
          </div>
          <Button onClick={loadSubscribers}>Yenile</Button>
        </div>

        {subscribers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz abone yok
          </div>
        ) : (
          <div className="space-y-2">
            {subscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50"
              >
                <div className="flex-1">
                  <p className="font-medium">{subscriber.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(subscriber.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={subscriber.is_active ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleActive(subscriber.id, subscriber.is_active)}
                  >
                    {subscriber.is_active ? "Aktif" : "Pasif"}
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(subscriber.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminSubscribers;
