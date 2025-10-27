import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Clip {
  id: string;
  title: string;
  file_path: string;
  category: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  gameplay: "🎮 Oyun Anları",
  funny: "😂 Komik",
  music: "🎵 Müzik",
  other: "📁 Diğer",
};

const Clips = () => {
  const navigate = useNavigate();
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchClips();
  }, []);

  const fetchClips = async () => {
    try {
      const { data, error } = await supabase
        .from('clips')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClips(data || []);
    } catch (error) {
      console.error("Error fetching clips:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from('clips').getPublicUrl(path);
    return data.publicUrl;
  };

  const filteredClips = selectedCategory
    ? clips.filter(clip => clip.category === selectedCategory)
    : clips;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 glow-text">Klipler</h1>
          <p className="text-muted-foreground mb-6">
            En iyi oyun anları, komik videolar ve ses kayıtları
          </p>
          <Button onClick={() => navigate("/klip-yukle")} className="mb-6">
            <Upload className="mr-2 h-4 w-4" />
            Klip Yükle
          </Button>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              Tümü
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                onClick={() => setSelectedCategory(key)}
                size="sm"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {filteredClips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Henüz klip yüklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClips.map((clip) => {
              const fileUrl = getFileUrl(clip.file_path);
              const isVideo = clip.file_path.match(/\.(mp4|webm|mov)$/i);
              
              return (
                <div key={clip.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {isVideo ? (
                      <video src={fileUrl} controls className="w-full h-full">
                        Tarayıcınız video oynatmayı desteklemiyor.
                      </video>
                    ) : (
                      <audio src={fileUrl} controls className="w-full px-4">
                        Tarayıcınız ses oynatmayı desteklemiyor.
                      </audio>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{clip.title}</h3>
                      <Badge variant="secondary">{categoryLabels[clip.category]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(clip.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clips;