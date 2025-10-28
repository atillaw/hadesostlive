import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Download, Share2, Play, Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Highlight {
  id: number;
  title: string;
  timestamp: string;
  duration: number;
  type: "hype" | "funny" | "epic" | "reaction";
  thumbnail: string;
}

const AIHighlightEditor = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const { toast } = useToast();

  const handleAnalyzeVOD = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate AI analysis
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    setTimeout(() => {
      const detectedHighlights: Highlight[] = [
        {
          id: 1,
          title: "Çılgın Reaksiyon!",
          timestamp: "00:23:45",
          duration: 18,
          type: "reaction",
          thumbnail: "/placeholder.svg",
        },
        {
          id: 2,
          title: "Efsane Hamle",
          timestamp: "01:15:22",
          duration: 25,
          type: "epic",
          thumbnail: "/placeholder.svg",
        },
        {
          id: 3,
          title: "Komik An",
          timestamp: "02:08:11",
          duration: 12,
          type: "funny",
          thumbnail: "/placeholder.svg",
        },
        {
          id: 4,
          title: "Hype Moment!",
          timestamp: "03:42:33",
          duration: 30,
          type: "hype",
          thumbnail: "/placeholder.svg",
        },
      ];

      setHighlights(detectedHighlights);
      setIsAnalyzing(false);
      
      toast({
        title: "Analiz Tamamlandı!",
        description: `${detectedHighlights.length} öne çıkan an bulundu.`,
      });
    }, 5500);
  };

  const typeColors = {
    hype: "bg-red-500/20 text-red-400 border-red-500/50",
    funny: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    epic: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    reaction: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  };

  const typeLabels = {
    hype: "Hype",
    funny: "Komik",
    epic: "Efsane",
    reaction: "Reaksiyon",
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Section */}
      <Card className="p-6 glass border-primary/30">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">AI Öne Çıkanlar Editörü</h2>
              <p className="text-sm text-muted-foreground">
                Uzun VOD'lardan otomatik olarak en iyi anları bul
              </p>
            </div>
          </div>

          {!isAnalyzing && highlights.length === 0 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
                <h4 className="font-medium mb-2">AI Neler Tespit Eder?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Yüksek ses seviyesi ve heyecan anları</li>
                  <li>• Gülme ve eğlenceli tepkiler</li>
                  <li>• Efsane oyun hamleleri</li>
                  <li>• Şaşkınlık ve reaksiyon anları</li>
                </ul>
              </div>

              <Button onClick={handleAnalyzeVOD} className="w-full h-12" size="lg">
                <Sparkles className="mr-2 h-5 w-5" />
                VOD'u AI ile Analiz Et
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>AI analiz ediyor...</span>
                <span className="font-bold">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                Bu işlem birkaç dakika sürebilir
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Detected Highlights */}
      {highlights.length > 0 && (
        <Card className="p-6 glass border-primary/30">
          <h3 className="text-xl font-bold mb-4">
            Bulunan Öne Çıkanlar ({highlights.length})
          </h3>

          <div className="space-y-4">
            {highlights.map((highlight) => (
              <Card
                key={highlight.id}
                className="p-4 bg-card/50 border-border/30 hover:border-primary/30 transition-all"
              >
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="h-8 w-8 text-primary" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold">{highlight.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {highlight.timestamp} • {highlight.duration}s
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          typeColors[highlight.type]
                        }`}
                      >
                        {typeLabels[highlight.type]}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        İzle
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        İndir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Paylaş
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Tüm Öne Çıkanları İndir
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIHighlightEditor;
