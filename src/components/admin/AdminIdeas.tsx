import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentIdea {
  id: string;
  email: string;
  idea: string;
  likes: number;
  created_at: string;
}

const AdminIdeas = () => {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("content_ideas")
      .select("*")
      .order("likes", { ascending: false });

    if (error) {
      console.error("Error loading ideas:", error);
      toast({
        title: "Hata",
        description: "Fikirler yüklenemedi.",
        variant: "destructive",
      });
    } else {
      setIdeas(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu fikri silmek istediğinizden emin misiniz?")) {
      return;
    }

    const { error } = await supabase
      .from("content_ideas")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Hata",
        description: "Fikir silinemedi.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Silindi",
        description: "Fikir başarıyla silindi.",
      });
      loadIdeas();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">İçerik Fikirleri</h2>
          <p className="text-muted-foreground">Toplam {ideas.length} fikir</p>
        </div>
        <Button onClick={loadIdeas}>Yenile</Button>
      </div>

      {ideas.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Henüz fikir yok</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ideas.map((idea) => (
            <Card key={idea.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-lg mb-1">{idea.idea}</p>
                  <p className="text-sm text-muted-foreground">
                    Gönderen: {idea.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(idea.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10">
                    <Heart className="h-4 w-4 text-primary fill-primary" />
                    <span className="font-bold text-primary">{idea.likes}</span>
                  </div>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(idea.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminIdeas;
