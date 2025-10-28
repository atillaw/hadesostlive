import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, Download, Share2, Play } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ClipCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [clipTitle, setClipTitle] = useState("");
  const [recentClips, setRecentClips] = useState<any[]>([]);
  const { toast } = useToast();

  const handleCreateClip = async () => {
    if (!clipTitle.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen klip için bir başlık girin",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    // Simulate clip creation
    setTimeout(() => {
      const newClip = {
        id: Date.now(),
        title: clipTitle,
        duration: 30,
        thumbnail: "/placeholder.svg",
        createdAt: new Date().toISOString(),
      };

      setRecentClips((prev) => [newClip, ...prev]);
      setClipTitle("");
      setIsCreating(false);

      toast({
        title: "Klip Oluşturuldu!",
        description: "Son 30 saniyelik an başarıyla kaydedildi",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Create Clip Section */}
      <Card className="p-6 glass border-primary/30">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Scissors className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Anında Klip Oluştur</h2>
              <p className="text-sm text-muted-foreground">
                Son 30 saniyeyi yakala ve paylaş
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              value={clipTitle}
              onChange={(e) => setClipTitle(e.target.value)}
              placeholder="Klip başlığı..."
              disabled={isCreating}
            />

            <Button
              onClick={handleCreateClip}
              disabled={isCreating || !clipTitle.trim()}
              className="w-full h-12"
              size="lg"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Klip Oluşturuluyor...
                </>
              ) : (
                <>
                  <Scissors className="mr-2 h-5 w-5" />
                  Bu Anı Yakala
                </>
              )}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
            <h4 className="font-medium mb-2">Nasıl Çalışır?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Canlı yayın sırasında özel bir an yakaladınız mı?</li>
              <li>• Başlık girin ve "Bu Anı Yakala" butonuna tıklayın</li>
              <li>• Son 30 saniye otomatik olarak kesilir ve kaydedilir</li>
              <li>• Klibinizi sosyal medyada paylaşın!</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Recent Clips */}
      {recentClips.length > 0 && (
        <Card className="p-6 glass border-primary/30">
          <h3 className="text-xl font-bold mb-4">Son Oluşturulan Klipler</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {recentClips.map((clip) => (
              <Card key={clip.id} className="p-4 bg-card/50 border-border/30 hover:border-primary/30 transition-all">
                <div className="space-y-3">
                  <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                    <Play className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{clip.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {clip.duration} saniye • {new Date(clip.createdAt).toLocaleTimeString("tr-TR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      İndir
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      Paylaş
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClipCreator;
