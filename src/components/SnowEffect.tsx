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

      {/* Snowmen on sides */}
      <div className="fixed left-4 bottom-4 z-40 pointer-events-none hidden lg:block animate-fade-in">
        <div className="text-6xl filter drop-shadow-lg">☃️</div>
      </div>
      <div className="fixed right-4 bottom-4 z-40 pointer-events-none hidden lg:block animate-fade-in">
        <div className="text-6xl filter drop-shadow-lg">☃️</div>
      </div>

      {/* Additional decorative snowmen */}
      <div className="fixed left-4 top-32 z-40 pointer-events-none hidden xl:block animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="text-5xl filter drop-shadow-lg">⛄</div>
      </div>
      <div className="fixed right-4 top-32 z-40 pointer-events-none hidden xl:block animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="text-5xl filter drop-shadow-lg">⛄</div>
      </div>
    </>
  );
};

export default SnowEffect;
