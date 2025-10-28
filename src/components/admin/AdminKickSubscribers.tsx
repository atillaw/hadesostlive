import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Subscriber {
  id: string;
  username: string;
  subscription_tier: string;
  subscription_type: string | null;
  subscribed_at: string;
}

const AdminKickSubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from("kick_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Aboneler yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`${username} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("kick_subscribers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `${username} silindi`,
      });
      loadSubscribers();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Abone silinemedi",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Tüm Aboneler ({subscribers.length})
        </CardTitle>
        <CardDescription>
          Kick kanalına abone olan tüm kullanıcılar
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz abone yok
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {subscribers.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{sub.username}</p>
                    <Badge variant="outline">{sub.subscription_tier}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sub.subscribed_at).toLocaleDateString("tr-TR")}
                    {sub.subscription_type && ` • ${sub.subscription_type}`}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(sub.id, sub.username)}
                  disabled={deletingId === sub.id}
                >
                  {deletingId === sub.id ? (
                    "Siliniyor..."
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminKickSubscribers;
