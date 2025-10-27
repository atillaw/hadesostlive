import { useEffect, useState } from "react";

interface SnowEffectProps {
  enabled: boolean;
}

const SnowEffect = ({ enabled }: SnowEffectProps) => {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([]);

  useEffect(() => {
    if (enabled) {
      const flakes = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
        size: 3 + Math.random() * 5
      }));
      setSnowflakes(flakes);
    } else {
      setSnowflakes([]);
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Falling Snowflakes */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute animate-snow-fall"
            style={{
              left: `${flake.left}%`,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
            }}
          >
            ❄️
          </div>
        ))}
      </div>
    </>
  );
};

export default SnowEffect;
