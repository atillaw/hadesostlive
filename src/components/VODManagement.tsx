import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VODManagement = () => {
  const [isScrapingVods, setIsScrapingVods] = useState(false);

  const handleScrapeVods = async () => {
    setIsScrapingVods(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("scrape-kick-vods");

      if (error) throw error;

      toast({
        title: "VODs Updated!",
        description: data.message || "Successfully scraped VODs from Kick",
      });

      // Reload the page to show new VODs
      window.location.reload();
    } catch (error) {
      toast({
        title: "Scraping Failed",
        description: "Could not fetch VODs from Kick. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScrapingVods(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="bg-card/50 backdrop-blur p-6 rounded-lg border border-border card-glow">
        <h3 className="text-2xl font-bold mb-4 glow-text">VOD Management</h3>
        <p className="text-muted-foreground mb-6">
          Automatically scrape and update VODs from your Kick channel
        </p>
        
        <Button
          onClick={handleScrapeVods}
          disabled={isScrapingVods}
          className="w-full md:w-auto"
        >
          <RefreshCw className={`mr-2 ${isScrapingVods ? "animate-spin" : ""}`} />
          {isScrapingVods ? "Scraping VODs..." : "Update VODs from Kick"}
        </Button>
      </div>
    </div>
  );
};

export default VODManagement;
