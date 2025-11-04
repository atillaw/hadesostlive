import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import AdSenseUnit from "@/components/AdSenseUnit";
import CustomAdUnit from "@/components/CustomAdUnit";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PageContentSectionProps {
  pageKey: string; // e.g., "clips", "vods", "community"
  title: string;
  description: string;
  features: { icon: React.ReactNode; title: string; description: string }[];
}

const PageContentSection = ({ pageKey, title, description, features }: PageContentSectionProps) => {
  const [showAds, setShowAds] = useState(true);

  useEffect(() => {
    checkAdSettings();
  }, [pageKey]);

  const checkAdSettings = async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", `ads_${pageKey}_enabled`)
        .maybeSingle();

      if (data?.value) {
        setShowAds(data.value as boolean);
      }
    } catch (error) {
      console.error("Error checking ad settings:", error);
    }
  };

  if (!showAds) return null;

  return (
    <section className="py-12 bg-background/50">
      <div className="container mx-auto px-4 space-y-8">
        {/* Platform Info */}
        <Card className="bg-card/50 backdrop-blur border-border card-glow">
          <CardHeader>
            <CardTitle className="text-2xl font-bold glow-text">
              {title}
            </CardTitle>
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="mb-2">{feature.icon}</div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Ücretsiz Platform:</strong> Tüm özelliklerimiz tamamen ücretsizdir. 
                Reklamlar sayesinde size kesintisiz hizmet sunabiliyoruz.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Ad Section */}
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Destekçilerimiz</CardTitle>
            <CardDescription>
              Platformumuzu destekleyen iş ortaklarımız
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Custom HTML Ad */}
            <div className="p-6 border border-border/50 rounded-lg bg-muted/30 min-h-[200px] flex items-center justify-center">
              <CustomAdUnit className="w-full" />
            </div>

            {/* AdSense Unit */}
            <div className="p-6 border border-border/50 rounded-lg bg-muted/30 min-h-[200px] flex items-center justify-center">
              <AdSenseUnit 
                format="auto"
                fullWidthResponsive={true}
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Reklam engelleyici kullanıyorsanız, bu reklamlar görünmeyebilir.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PageContentSection;
