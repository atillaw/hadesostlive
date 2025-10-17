import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ClockSettings {
  enabled: boolean;
  format: "12h" | "24h";
  offsetHours: number;
  offsetMinutes: number;
  timezone: string;
  label: string;
}

const AdminClock = () => {
  const [settings, setSettings] = useState<ClockSettings>({
    enabled: true,
    format: "24h",
    offsetHours: 0,
    offsetMinutes: 0,
    timezone: "Europe/Istanbul",
    label: "Şu anki saat",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "footer_clock")
      .maybeSingle();

    if (error) {
      console.error("Error loading clock settings:", error);
    } else if (data) {
      setSettings(data.value as unknown as ClockSettings);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("site_settings")
      .upsert({
        key: "footer_clock",
        value: settings as any,
      }, {
        onConflict: 'key'
      });

    if (error) {
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilemedi.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Kaydedildi",
        description: "Saat ayarları güncellendi.",
      });
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Footer Saat Ayarları</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enabled">Saati Göster</Label>
            <p className="text-sm text-muted-foreground">
              Footer'da saat gösterilsin mi?
            </p>
          </div>
          <Switch
            id="enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, enabled: checked })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Etiket Metni</Label>
          <Input
            id="label"
            value={settings.label}
            onChange={(e) => setSettings({ ...settings, label: e.target.value })}
            placeholder="Örn: Şu anki saat"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Saat Formatı</Label>
          <Select
            value={settings.format}
            onValueChange={(value: "12h" | "24h") =>
              setSettings({ ...settings, format: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12 Saat (AM/PM)</SelectItem>
              <SelectItem value="24h">24 Saat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="offsetHours">Saat Farkı</Label>
            <Input
              id="offsetHours"
              type="number"
              value={settings.offsetHours}
              onChange={(e) =>
                setSettings({ ...settings, offsetHours: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
              min="-12"
              max="12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offsetMinutes">Dakika Farkı</Label>
            <Input
              id="offsetMinutes"
              type="number"
              value={settings.offsetMinutes}
              onChange={(e) =>
                setSettings({ ...settings, offsetMinutes: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
              min="-59"
              max="59"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Zaman Dilimi</Label>
          <Input
            id="timezone"
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            placeholder="Europe/Istanbul"
          />
          <p className="text-xs text-muted-foreground">
            Örnek: Europe/Istanbul, America/New_York, Asia/Tokyo
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </Button>
      </div>
    </Card>
  );
};

export default AdminClock;
