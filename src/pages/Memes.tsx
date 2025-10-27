import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowLeft, ImageIcon } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";

interface Meme {
  id: string;
  title: string;
  image_path: string;
  created_at: string;
}

const Memes = () => {
  const navigate = useNavigate();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      const { data, error } = await supabase
        .from('meme_uploads')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemes(data || []);
    } catch (error: any) {
      console.error('Error fetching memes:', error);
      toast.error("Memeler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage
      .from('memes')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12 animate-fade-in">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="hover:scale-105 transition-transform"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
          
          <Button 
            onClick={() => navigate("/yukle")}
            className="hover:scale-105 transition-transform"
          >
            <Upload className="mr-2 h-4 w-4" />
            Meme Yükle
          </Button>
        </div>

        <div className="text-center mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">Shit Photo / Memes</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Topluluk tarafından paylaşılan komik anlar 😂
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card/50 backdrop-blur rounded-xl border border-border overflow-hidden">
                <div className="aspect-square skeleton" />
                <div className="p-4">
                  <div className="h-6 skeleton rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : memes.length === 0 ? (
          <div className="text-center py-20 animate-scale-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-4">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-4">
              Henüz onaylanmış meme yok
            </p>
            <Button 
              onClick={() => navigate("/yukle")}
              size="lg"
              className="hover:scale-105 transition-transform"
            >
              <Upload className="mr-2 h-5 w-5" />
              İlk Meme'i Sen Yükle!
            </Button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {memes.map((meme, index) => (
              <div 
                key={meme.id} 
                className="break-inside-avoid mb-4 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className="group overflow-hidden card-glow bg-card/50 backdrop-blur-sm border-primary/30 hover:border-primary/60 transition-all">
                  <CardContent className="p-0 relative">
                    <img
                      src={getImageUrl(meme.image_path)}
                      alt={meme.title}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </CardContent>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {meme.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(meme.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Memes;
