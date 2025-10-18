import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CountdownSettings {
  id?: string;
  enabled: boolean;
  target_date: string;
  label: string;
}

const AdminCountdown = () => {
  const [settings, setSettings] = useState<CountdownSettings>({
    enabled: false,
    target_date: new Date().toISOString(),
    label: "Countdown",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("00:00");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from("countdown_timer")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error loading countdown settings:", error);
    } else if (data) {
      setSettings(data);
      const targetDate = new Date(data.target_date);
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

    const [hours, minutes] = time.split(":");
    const targetDate = new Date(date);
    targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const payload = {
      enabled: settings.enabled,
      target_date: targetDate.toISOString(),
      label: settings.label,
    };

    const { error } = settings.id
      ? await supabase
          .from("countdown_timer")
          .update(payload)
          .eq("id", settings.id)
      : await supabase.from("countdown_timer").insert(payload);

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
      loadSettings();
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
              Footer'da geri sayım gösterilsin mi?
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
            placeholder="Örn: Yayına Kalan Süre"
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
