import { useEffect, useState } from "react";

interface WeatherEffectsProps {
  enabled: boolean;
  season?: 'winter' | 'spring' | 'summer' | 'autumn';
}

const WeatherEffects = ({ enabled, season = 'winter' }: WeatherEffectsProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([]);

  useEffect(() => {
    if (enabled) {
      const particleCount = season === 'winter' ? 50 : 30;
      const flakes = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
        size: season === 'winter' ? 3 + Math.random() * 5 : 2 + Math.random() * 3
      }));
      setParticles(flakes);
    } else {
      setParticles([]);
    }
  }, [enabled, season]);

  if (!enabled) return null;

  const getParticleContent = () => {
    switch (season) {
      case 'winter':
        return '❄️';
      case 'summer':
        return '✨';
      case 'spring':
        return '🌸';
      case 'autumn':
        return '🍂';
      default:
        return '❄️';
    }
  };

  const getAnimationClass = () => {
    switch (season) {
      case 'summer':
        return 'animate-float-slow';
      case 'spring':
      case 'autumn':
        return 'animate-drift';
      default:
        return 'animate-snow-fall';
    }
  };

  return (
    <>
      {/* Weather Particles */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={getAnimationClass()}
            style={{
              position: 'absolute',
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: season === 'summer' ? 0.6 : 1,
            }}
          >
            {getParticleContent()}
          </div>
        ))}
      </div>

      {/* Mist/Fog Effect */}
      {(season === 'winter' || season === 'autumn') && (
        <div className="fixed inset-0 pointer-events-none z-40 animate-mist">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        </div>
      )}

      {/* Heat Haze Effect for Summer */}
      {season === 'summer' && (
        <div className="fixed inset-0 pointer-events-none z-40 animate-heat-haze">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        </div>
      )}
    </>
  );
};

export default WeatherEffects;
