import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CountdownSettings {
  enabled: boolean;
  targetDate: string;
  label: string;
}

const AdminCountdown = () => {
  const [settings, setSettings] = useState<CountdownSettings>({
    enabled: false,
    targetDate: new Date().toISOString(),
    label: "Yayına kadar",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "footer_countdown")
      .maybeSingle();

    if (data) {
      const loadedSettings = data.value as unknown as CountdownSettings;
      setSettings(loadedSettings);
      const targetDate = new Date(loadedSettings.targetDate);
      setDate(targetDate);
      setTime(format(targetDate, "HH:mm"));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!date) {
      toast({
        title: "Hata",
        description: "Lütfen bir tarih seçin.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const [hours, minutes] = time.split(":").map(Number);
    const targetDate = new Date(date);
    targetDate.setHours(hours, minutes, 0, 0);

    const updatedSettings = {
      ...settings,
      targetDate: targetDate.toISOString(),
    };

    const { error } = await supabase
      .from("site_settings")
      .upsert({
        key: "footer_countdown",
        value: updatedSettings as any,
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
        description: "Geri sayım ayarları güncellendi.",
      });
      setSettings(updatedSettings);
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Geri Sayım Ayarları</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enabled">Geri Sayımı Göster</Label>
            <p className="text-sm text-muted-foreground">
              Footer'da analog geri sayım gösterilsin mi?
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
            placeholder="Örn: Yayına kadar"
          />
        </div>

        <div className="space-y-2">
          <Label>Hedef Tarih</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Tarih seçin</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Hedef Saat</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </Button>
      </div>
    </Card>
  );
};

export default AdminCountdown;
