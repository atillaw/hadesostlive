import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CountdownSettings {
  enabled: boolean;
  targetDate: string;
  label: string;
}

const FooterCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [settings, setSettings] = useState<CountdownSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (!settings?.enabled) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(settings.targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft("00:00:00:00");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "footer_countdown")
      .maybeSingle();

    if (data) {
      setSettings(data.value as unknown as CountdownSettings);
    }
  };

  if (!settings?.enabled) return null;

  const [days, hours, minutes, seconds] = timeLeft.split(":");

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Timer className="h-4 w-4" />
        <span>{settings.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center font-mono font-bold text-primary">
            {days}
          </div>
          <span className="text-xs text-muted-foreground mt-1">Gün</span>
        </div>
        <span className="text-primary font-bold">:</span>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center font-mono font-bold text-primary">
            {hours}
          </div>
          <span className="text-xs text-muted-foreground mt-1">Saat</span>
        </div>
        <span className="text-primary font-bold">:</span>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center font-mono font-bold text-primary">
            {minutes}
          </div>
          <span className="text-xs text-muted-foreground mt-1">Dk</span>
        </div>
        <span className="text-primary font-bold">:</span>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center font-mono font-bold text-primary">
            {seconds}
          </div>
          <span className="text-xs text-muted-foreground mt-1">Sn</span>
        </div>
      </div>
    </div>
  );
};

export default FooterCountdown;
