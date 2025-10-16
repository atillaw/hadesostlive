import { useState, useEffect } from "react";
import { Clock as ClockIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClockSettings {
  enabled: boolean;
  format: "12h" | "24h";
  offsetHours: number;
  offsetMinutes: number;
  timezone: string;
  label: string;
}

const FooterClock = () => {
  const [time, setTime] = useState("");
  const [settings, setSettings] = useState<ClockSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (!settings?.enabled) return;

    const updateTime = () => {
      const now = new Date();
      
      // Apply offset
      now.setHours(now.getHours() + settings.offsetHours);
      now.setMinutes(now.getMinutes() + settings.offsetMinutes);

      let timeString: string;
      if (settings.format === "12h") {
        timeString = now.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
      } else {
        timeString = now.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      }

      setTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "footer_clock")
      .single();

    if (data) {
      setSettings(data.value as ClockSettings);
    }
  };

  if (!settings?.enabled) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <ClockIcon className="h-4 w-4" />
      <span>{settings.label}:</span>
      <span className="font-mono font-bold text-primary">{time}</span>
    </div>
  );
};

export default FooterClock;
