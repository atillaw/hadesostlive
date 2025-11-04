import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Info, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface AdPlacement {
  key: string;
  label: string;
  description: string;
  location: string;
  enabled: boolean;
}

const AD_PLACEMENTS: AdPlacement[] = [
  {
    key: "ads_home_enabled",
    label: "Ana Sayfa Reklamları",
    description: "Ana sayfanın altında görünen reklam bölümü",
    location: "Ana Sayfa (Footer Üstü)",
    enabled: true
  },
  {
    key: "ads_support_enabled",
    label: "Destek Sayfası Reklamları",
    description: "Destek sayfasında görünen reklam bölümleri",
    location: "Destek Sayfası",
    enabled: true
  },
  {
    key: "ads_clips_enabled",
    label: "Klipler Sayfası Reklamları",
    description: "Klipler sayfasının altında görünen reklam bölümü",
    location: "Klipler Sayfası (Liste Altı)",
    enabled: true
  },
  {
    key: "ads_vods_enabled",
    label: "VOD Sayfası Reklamları",
    description: "VOD sayfasının altında görünen reklam bölümü",
    location: "VOD Sayfası (Liste Altı)",
    enabled: true
  },
  {
    key: "ads_community_enabled",
    label: "Topluluk Sayfası Reklamları",
    description: "Topluluk sayfasının altında görünen reklam bölümü",
    location: "Topluluk Sayfası (Alt Kısım)",
    enabled: true
  },
  {
    key: "ads_memes_enabled",
    label: "Memes Sayfası Reklamları",
    description: "Memes sayfasının altında görünen reklam bölümü",
    location: "Memes Sayfası (Liste Altı)",
    enabled: true
  }
];

const AdminAdPlacements = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [placements, setPlacements] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadAdPlacements();
  }, []);

  const loadAdPlacements = async () => {
    try {
      const placementKeys = AD_PLACEMENTS.map(p => p.key);
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", placementKeys);

      if (error) throw error;

      const placementMap: Record<string, boolean> = {};
      AD_PLACEMENTS.forEach(p => {
        const setting = data?.find(d => d.key === p.key);
        placementMap[p.key] = setting ? (setting.value as boolean) : p.enabled;
      });

      setPlacements(placementMap);
    } catch (error: any) {
      console.error("Reklam yeri ayarları yüklenemedi:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Reklam yeri ayarları yüklenemedi",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlacement = async (key: string, enabled: boolean) => {
    setPlacements(prev => ({ ...prev, [key]: enabled }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(placements).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("site_settings")
        .upsert(updates, { onConflict: "key" });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Reklam yeri ayarları kaydedildi",
      });
    } catch (error: any) {
      console.error("Reklam yeri ayarları kaydedilemedi:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Reklam yeri ayarları kaydedilemedi",
      });
    } finally {
      setSaving(false);
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
        <CardTitle className="glow-text flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Reklam Yerleşimleri
        </CardTitle>
        <CardDescription>
          Sitedeki reklam alanlarını yönetin. Her sayfada reklamların gösterilip gösterilmeyeceğini kontrol edebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Reklam içerikleri (AdSense ve HTML kodları) AdSense Ayarları bölümünden yönetilir.
            Buradan sadece hangi sayfalarda reklam gösterileceğini belirleyebilirsiniz.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {AD_PLACEMENTS.map((placement, index) => (
            <div key={placement.key}>
              <div className="flex items-start justify-between gap-4 py-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={placement.key} className="font-semibold">
                      {placement.label}
                    </Label>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {placement.location}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {placement.description}
                  </p>
                </div>
                <Switch
                  id={placement.key}
                  checked={placements[placement.key] || false}
                  onCheckedChange={(checked) => handleTogglePlacement(placement.key, checked)}
                />
              </div>
              {index < AD_PLACEMENTS.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Tüm Ayarları Kaydet
              </>
            )}
          </Button>
        </div>

        <Alert className="bg-muted/50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Not:</strong> Değişiklikler kaydedildikten sonra ilgili sayfalarda anında etkili olur.
            Reklamları görmek için sayfayı yenilemeniz gerekebilir.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AdminAdPlacements;
