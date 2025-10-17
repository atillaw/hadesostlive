import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentIdea {
  id: string;
  email: string;
  idea: string;
  likes: number;
  created_at: string;
}

const ContentIdeasSection = () => {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadIdeas();
    // Try to get email from localStorage
    const savedEmail = localStorage.getItem("user_email");
    if (savedEmail) {
      setUserEmail(savedEmail);
      setEmail(savedEmail);
    }
  }, []);

  const loadIdeas = async () => {
    const { data, error } = await supabase
      .from("content_ideas")
      .select("*")
      .order("likes", { ascending: false });

    if (error) {
      console.error("Error loading ideas:", error);
      return;
    }

    setIdeas(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !newIdea.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Geçersiz E-posta",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive",
      });
      return;
    }

    // Check if user already submitted an idea
    const { data: existingIdeas } = await supabase
      .from("content_ideas")
      .select("id")
      .eq("email", email.toLowerCase());

    if (existingIdeas && existingIdeas.length > 0) {
      toast({
        title: "Fikir Zaten Gönderildi",
        description: "Her kullanıcı sadece bir fikir gönderebilir.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("content_ideas")
        .insert({
          email: email.toLowerCase(),
          idea: newIdea.trim(),
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Bu Fikir Zaten Var",
            description: "Bu fikir daha önce gönderilmiş.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Fikir Gönderildi!",
        description: "Fikriniz başarıyla eklendi.",
      });

      localStorage.setItem("user_email", email);
      setUserEmail(email);
      setNewIdea("");
      loadIdeas();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (ideaId: string) => {
    if (!userEmail) {
      toast({
        title: "E-posta Gerekli",
        description: "Beğenmek için önce bir fikir gönderin veya e-posta adresinizi girin.",
        variant: "destructive",
      });
      return;
    }

    try {
      await supabase.rpc("increment_idea_likes", {
        _idea_id: ideaId,
      });

      const error = null;

      if (error) throw error;

      toast({
        title: "Beğenildi! ❤️",
        description: "Fikir beğendiniz.",
      });
      loadIdeas();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-4xl font-bold mb-4 text-center glow-text">
          Oyun & İçerik Fikirleri
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Yayınlarda görmek istediğin oyun veya içerik fikirlerini paylaş!
        </p>

        <Card className="p-6 mb-8 bg-card/50 backdrop-blur border-border card-glow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresiniz</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                disabled={!!userEmail}
              />
              {userEmail && (
                <p className="text-xs text-muted-foreground">
                  Kayıtlı e-posta: {userEmail}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idea">Fikriniz</Label>
              <Input
                id="idea"
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                placeholder="Örn: Valorant, Minecraft modlu survival..."
                required
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {newIdea.length}/200 karakter
              </p>
            </div>

            <Button type="submit" disabled={loading || !!userEmail} className="w-full">
              {loading ? "Gönderiliyor..." : userEmail ? "Zaten Fikir Gönderdiniz" : "Fikir Gönder"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold mb-4">Tüm Fikirler</h3>
          {ideas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Henüz fikir gönderilmemiş. İlk sen ol!
            </p>
          ) : (
            ideas.map((idea) => (
              <Card
                key={idea.id}
                className="p-4 bg-card/30 backdrop-blur border-border hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-lg">{idea.idea}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(idea.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLike(idea.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors group"
                  >
                    <Heart
                      className="h-5 w-5 text-primary/60 group-hover:text-primary group-hover:fill-primary transition-all"
                    />
                    <span className="font-bold text-primary">{idea.likes}</span>
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ContentIdeasSection;
