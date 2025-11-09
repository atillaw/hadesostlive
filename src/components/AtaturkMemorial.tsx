import { useEffect, useState } from "react";
import ataturkImage from "@/assets/ataturk-memorial.png";

const AtaturkMemorial = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const now = new Date();
      const startDate = new Date('2025-11-10T00:00:00');
      const endDate = new Date('2025-11-11T12:00:00');
      
      setIsVisible(now >= startDate && now < endDate);
    };

    checkVisibility();
    const interval = setInterval(checkVisibility, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-b from-black/95 to-black/80 py-8 relative overflow-hidden">
      {/* Subtle pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Atatürk Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
            <img 
              src={ataturkImage} 
              alt="Mustafa Kemal Atatürk" 
              className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full opacity-90 relative z-10 border-2 border-white/20"
            />
          </div>

          {/* Memorial Text */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-4xl font-bold text-white tracking-wide">
              Unutmadık, Unutmayacağız
            </h2>
            <div className="flex items-center justify-center space-x-3 text-white/90">
              <span className="text-xl md:text-2xl font-light">1881</span>
              <span className="text-2xl md:text-3xl">-</span>
              <span className="text-xl md:text-2xl font-light">193<span className="inline-block text-3xl md:text-4xl">∞</span></span>
            </div>
          </div>

          {/* Decorative line */}
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default AtaturkMemorial;
