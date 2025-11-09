import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const AdminMemorialBanner = () => {
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ataturk_memorial_visible")
        .maybeSingle();

      if (error) throw error;

      setIsVisible(data?.value === true);
    } catch (error: any) {
      console.error("Anma banner ayarları yüklenemedi:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Anma banner ayarları yüklenemedi",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: "ataturk_memorial_visible",
          value: checked,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "key"
        });

      if (error) throw error;

      setIsVisible(checked);
      toast({
        title: "Başarılı",
        description: checked 
          ? "Anma banner'ı gösterilecek" 
          : "Anma banner'ı gizlendi",
      });
    } catch (error: any) {
      console.error("Ayar kaydedilemedi:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ayar kaydedilemedi",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="glow-text">10 Kasım Atatürk Anma Banner'ı</CardTitle>
        <CardDescription>
          Ana sayfada gösterilecek Atatürk anma banner'ını yönetin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="memorial-banner">Banner Görünürlüğü</Label>
            <p className="text-sm text-muted-foreground">
              Ana sayfanın en üstünde Atatürk anma banner'ı gösterilsin mi?
            </p>
          </div>
          <Switch
            id="memorial-banner"
            checked={isVisible}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminMemorialBanner;
