import { Button } from "@/components/ui/button";
import { Twitch, Radio } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
          <span className="text-secondary font-semibold uppercase tracking-wider text-sm">
            LİVE NOW
          </span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 glow-text">
          Hadesost
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
         Oyun yayınları, destansı müzikler ve efsanevi atmosfer. Yeraltı dünyasının en özel topluluğuna katıl!
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="text-lg px-8">
            <Radio className="w-5 h-5" />
            Kick'te İzle
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            <Twitch className="w-5 h-5" />
           Discord linki
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
