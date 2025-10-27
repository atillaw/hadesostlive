import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import MemeChatRoom from "@/components/MemeChatRoom";

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
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
          
          <Button onClick={() => navigate("/yukle")}>
            <Upload className="mr-2 h-4 w-4" />
            Meme Yükle
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Shit Photo / Memes</h1>
          <p className="text-muted-foreground">
            Topluluk tarafından paylaşılan komik anlar
          </p>
        </div>

        {/* Chat Room */}
        <div className="mb-12">
          <MemeChatRoom />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : memes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Henüz onaylanmış meme yok
            </p>
            <Button onClick={() => navigate("/yukle")}>
              <Upload className="mr-2 h-4 w-4" />
              İlk Meme'i Sen Yükle!
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memes.map((meme) => (
              <Card key={meme.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{meme.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <img
                    src={getImageUrl(meme.image_path)}
                    alt={meme.title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Memes;
