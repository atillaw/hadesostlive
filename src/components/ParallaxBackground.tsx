import { useEffect, useState } from "react";

const ParallaxBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Layer 1 - Farthest mountains */}
      <div
        className="absolute inset-0 opacity-20 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          background: 'radial-gradient(ellipse at 30% 60%, hsl(271 50% 15%) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, hsl(271 50% 15%) 0%, transparent 50%)',
        }}
      />
      
      {/* Layer 2 - Middle fog */}
      <div
        className="absolute inset-0 opacity-30 transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 1}px, ${mousePosition.y * 1}px)`,
          background: 'radial-gradient(ellipse at 50% 70%, hsl(271 50% 10% / 0.5) 0%, transparent 60%)',
        }}
      />
      
      {/* Layer 3 - Closest atmospheric glow */}
      <div
        className="absolute inset-0 opacity-40 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 1.5}px, ${mousePosition.y * 1.5}px)`,
          background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)',
        }}
      />
    </div>
  );
};

export default ParallaxBackground;
