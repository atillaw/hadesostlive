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
    <section className="py-16 md:py-24 px-4 animate-fade-in">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">
            Oyun & İçerik Fikirleri
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Yayınlarda görmek istediğin oyun veya içerik fikirlerini paylaş! 💡
          </p>
        </div>

        <Card className="snow-accent p-6 md:p-8 mb-10 bg-card/50 backdrop-blur-sm border-primary/30 card-glow animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">E-posta Adresiniz</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                disabled={!!userEmail}
                className="h-11"
              />
              {userEmail && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Kayıtlı e-posta: {userEmail}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idea" className="text-base">Fikriniz</Label>
              <Input
                id="idea"
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                placeholder="Örn: Valorant, Minecraft modlu survival..."
                required
                maxLength={200}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                {newIdea.length}/200 karakter
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={loading || !!userEmail} 
              className="w-full h-12 text-base hover:scale-105 transition-transform"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Gönderiliyor...
                </span>
              ) : userEmail ? (
                "Zaten Fikir Gönderdiniz"
              ) : (
                "Fikir Gönder"
              )}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 animate-slide-up">En Popüler Fikirler</h3>
          {ideas.length === 0 ? (
            <div className="text-center py-12 animate-scale-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-center text-muted-foreground text-lg">
                Henüz fikir gönderilmemiş. İlk sen ol! 🚀
              </p>
            </div>
          ) : (
            ideas.map((idea, index) => (
              <Card
                key={idea.id}
                className="group p-5 md:p-6 bg-card/50 backdrop-blur-sm border-primary/30 hover:border-primary/60 transition-all card-glow animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-lg md:text-xl mb-2 group-hover:text-primary transition-colors">
                      {idea.idea}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(idea.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLike(idea.id)}
                    className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl hover:bg-primary/10 transition-all group/like hover:scale-110"
                  >
                    <Heart
                      className="h-6 w-6 text-primary/60 group-hover/like:text-primary group-hover/like:fill-primary transition-all"
                    />
                    <span className="font-bold text-primary text-lg">{idea.likes}</span>
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
