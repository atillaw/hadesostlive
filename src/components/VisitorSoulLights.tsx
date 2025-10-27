import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Soul {
  id: string;
  x: number;
  y: number;
  delay: number;
}

const VisitorSoulLights = () => {
  const [souls, setSouls] = useState<Soul[]>([]);
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const channel = supabase.channel('presence-souls', {
      config: {
        presence: {
          key: crypto.randomUUID(),
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setVisitorCount(count);

        // Generate soul positions based on visitor count
        const newSouls: Soul[] = Array.from({ length: Math.min(count, 10) }, (_, i) => ({
          id: `soul-${i}`,
          x: 10 + (i * 8),
          y: 85 + Math.random() * 10,
          delay: Math.random() * 5,
        }));
        setSouls(newSouls);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-20">
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        {visitorCount} souls wandering
      </div>
      {souls.map((soul) => (
        <div
          key={soul.id}
          className="absolute animate-soul-drift"
          style={{
            left: `${soul.x}%`,
            bottom: `${soul.y - 85}%`,
            animationDelay: `${soul.delay}s`,
          }}
        >
          <div className="w-3 h-3 rounded-full bg-primary/60 blur-sm animate-pulse-glow" />
        </div>
      ))}
    </div>
  );
};

export default VisitorSoulLights;
