import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VODManagement = () => {
  const [isScrapingVods, setIsScrapingVods] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const handleScrapeVods = async () => {
    setIsScrapingVods(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("scrape-kick-vods");

      if (error) throw error;

      const newVodsCount = data?.total || 0;
      setLastUpdate(new Date().toLocaleString('tr-TR'));
      
      toast({
        title: "VOD'lar Güncellendi! 🎉",
        description: `${newVodsCount} adet 1 saatten uzun VOD bulundu ve eklendi.`,
      });

      // Reload the page to show new VODs
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error("VOD scraping error:", error);
      toast({
        title: "VOD Çekme Başarısız",
        description: error.message || "Kick'ten VOD çekilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsScrapingVods(false);
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur p-6 rounded-lg border border-border card-glow">
      <h3 className="text-2xl font-bold mb-2 glow-text">Otomatik VOD Yönetimi</h3>
      <p className="text-muted-foreground mb-4">
        Kick kanalınızdan 1 saatten uzun VOD'ları otomatik olarak çeker ve ekler
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-primary">✓</span> 1 saatten uzun videolar
          </div>
          <div className="flex items-center gap-1">
            <span className="text-primary">✓</span> Otomatik thumbnail
          </div>
          <div className="flex items-center gap-1">
            <span className="text-primary">✓</span> En son 10 video
          </div>
        </div>
        
        <Button
          onClick={handleScrapeVods}
          disabled={isScrapingVods}
          className="w-full md:w-auto rounded-full"
          size="lg"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isScrapingVods ? "animate-spin" : ""}`} />
          {isScrapingVods ? "VOD'lar Çekiliyor..." : "Kick'ten VOD'ları Güncelle"}
        </Button>
        
        {lastUpdate && (
          <p className="text-xs text-muted-foreground">
            Son güncelleme: {lastUpdate}
          </p>
        )}
      </div>
    </div>
  );
};

export default VODManagement;
