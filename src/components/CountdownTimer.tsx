import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CountdownSettings {
  enabled: boolean;
  target_date: string;
  label: string;
}

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [settings, setSettings] = useState<CountdownSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (!settings?.enabled) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(settings.target_date).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("countdown_timer")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setSettings(data);
    }
  };

  if (!settings?.enabled) return null;

  return (
    <div className="flex flex-col items-center gap-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Timer className="h-4 w-4" />
        <span>{settings.label}:</span>
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex flex-col items-center bg-card/50 backdrop-blur rounded-lg p-3 min-w-[60px] border border-primary/20">
          <span className="text-2xl font-bold text-primary font-mono">
            {String(timeLeft.days).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">Gün</span>
        </div>
        <span className="text-primary text-xl">:</span>
        <div className="flex flex-col items-center bg-card/50 backdrop-blur rounded-lg p-3 min-w-[60px] border border-primary/20">
          <span className="text-2xl font-bold text-primary font-mono">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">Saat</span>
        </div>
        <span className="text-primary text-xl">:</span>
        <div className="flex flex-col items-center bg-card/50 backdrop-blur rounded-lg p-3 min-w-[60px] border border-primary/20">
          <span className="text-2xl font-bold text-primary font-mono">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">Dakika</span>
        </div>
        <span className="text-primary text-xl">:</span>
        <div className="flex flex-col items-center bg-card/50 backdrop-blur rounded-lg p-3 min-w-[60px] border border-primary/20">
          <span className="text-2xl font-bold text-primary font-mono">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">Saniye</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
