import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";

const YouTubeSection = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-background to-red-600/5 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1)_0%,transparent_50%)] pointer-events-none"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 blur-3xl opacity-30 animate-pulse"></div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 glow-text relative bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              YouTube Kanalım
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            En iyi anlar, özel içerikler ve daha fazlası YouTube kanalımda seni bekliyor! 🎮✨
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 glass border-2 border-red-500/20 shadow-2xl shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02] hover:border-red-500/40 transition-all duration-500 animate-scale-in relative overflow-hidden group">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            <div className="flex flex-col items-center gap-8 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center shadow-2xl shadow-red-500/50 animate-float border-4 border-red-400/30">
                  <Youtube className="w-14 h-14 text-white drop-shadow-lg" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  HadesOST
                </h3>
                <p className="text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed">
                  🎬 Oyun videoları, canlı yayın kayıtları ve özel içerikler için kanalıma abone olmayı unutma!
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    Gaming İçerikleri
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    Yayın Kayıtları
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    Özel Videolar
                  </span>
                </div>
              </div>

              <a 
                href="https://www.youtube.com/@hadesost" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full max-w-md group/btn"
              >
                <Button 
                  className="w-full rounded-full group/btn h-14 text-lg font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-lg shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/50 border-2 border-red-400/30 hover:border-red-400/50 transition-all duration-300"
                  size="lg"
                >
                  <Youtube className="mr-2 h-6 w-6 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-transform duration-300" />
                  YouTube Kanalına Git
                  <svg className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
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
