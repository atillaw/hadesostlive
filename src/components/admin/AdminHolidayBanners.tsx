import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { HOLIDAYS } from "@/types/holidays";

const AdminHolidayBanners = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", HOLIDAYS.map(h => h.key));

      if (error) throw error;

      const settingsMap: Record<string, boolean> = {};
      data?.forEach((setting) => {
        settingsMap[setting.key] = setting.value === true;
      });
      
      setSettings(settingsMap);
    } catch (error: any) {
      console.error("Banner ayarları yüklenemedi:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Banner ayarları yüklenemedi",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string, checked: boolean) => {
    try {
      // First, turn off all other holidays if this one is being enabled
      if (checked) {
        const otherKeys = HOLIDAYS.map(h => h.key).filter(k => k !== key);
        for (const otherKey of otherKeys) {
          await supabase
            .from("site_settings")
            .upsert({
              key: otherKey,
              value: false,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "key"
            });
        }
      }

      // Then update the selected holiday
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: key,
          value: checked,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "key"
        });

      if (error) throw error;

      // Update local state
      const newSettings: Record<string, boolean> = {};
      HOLIDAYS.forEach(h => {
        newSettings[h.key] = h.key === key ? checked : false;
      });
      setSettings(newSettings);

      const holiday = HOLIDAYS.find(h => h.key === key);
      toast({
        title: "Başarılı",
        description: checked 
          ? `${holiday?.name} banner'ı gösterilecek` 
          : `${holiday?.name} banner'ı gizlendi`,
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
        <CardTitle className="glow-text">Bayram Banner Yönetimi</CardTitle>
        <CardDescription>
          Ana sayfada gösterilecek bayram banner'larını yönetin. Aynı anda sadece bir banner aktif olabilir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {HOLIDAYS.map((holiday) => (
            <div key={holiday.key} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
              <div className="space-y-1">
                <Label htmlFor={holiday.key} className="font-semibold">{holiday.name}</Label>
                <p className="text-sm text-muted-foreground">
                  {holiday.description}
                </p>
              </div>
              <Switch
                id={holiday.key}
                checked={settings[holiday.key] || false}
                onCheckedChange={(checked) => handleToggle(holiday.key, checked)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminHolidayBanners;
