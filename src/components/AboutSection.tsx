import { Card } from "@/components/ui/card";
import { Gamepad2, Music, Users } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-20 container mx-auto px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          About HadesOST
        </h2>
        
        <Card className="p-8 mb-8 border-primary/20 card-glow">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to the underworld! I'm HadesOST, and I bring you high-energy gaming streams 
            combined with epic soundtracks that'll make your heart race. Whether it's grinding through 
            roguelikes, exploring new worlds, or just vibing to incredible music, this is your destination 
            for quality entertainment and a legendary community.
          </p>
        </Card>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center border-primary/20 hover:border-primary/40 transition-all duration-300">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Gaming</h3>
            <p className="text-muted-foreground">
              Roguelikes, RPGs, and everything in between
            </p>
          </Card>
          
          <Card className="p-6 text-center border-primary/20 hover:border-primary/40 transition-all duration-300">
            <Music className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Music</h3>
            <p className="text-muted-foreground">
              Epic soundtracks and original compositions
            </p>
          </Card>
          
          <Card className="p-6 text-center border-primary/20 hover:border-primary/40 transition-all duration-300">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Community</h3>
            <p className="text-muted-foreground">
              Join a vibrant community of gamers and music lovers
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
