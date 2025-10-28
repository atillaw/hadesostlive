import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";

const YouTubeSection = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background pointer-events-none"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
            YouTube Kanalım
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            En iyi anlar, özel içerikler ve daha fazlası YouTube kanalımda!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 card-glow hover:scale-[1.02] transition-all duration-300">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/50">
                <Youtube className="w-12 h-12 text-white" />
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">HadesOST</h3>
                <p className="text-muted-foreground mb-6">
                  Oyun videoları, canlı yayın kayıtları ve özel içerikler için kanalıma abone olmayı unutma!
                </p>
              </div>

              <a 
                href="https://www.youtube.com/@hadesost" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full max-w-md"
              >
                <Button 
                  className="w-full group"
                  size="lg"
                >
                  <Youtube className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  YouTube Kanalına Git
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
