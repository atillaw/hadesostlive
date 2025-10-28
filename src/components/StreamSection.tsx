import { Card } from "@/components/ui/card";

const StreamSection = () => {
  return (
    <section className="py-16 md:py-24 container mx-auto px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">
            Live Stream
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Canlı yayını izle, sohbete katıl ve topluluğun bir parçası ol!
          </p>
        </div>
        
        <div className="grid lg:grid-cols-[1fr,400px] gap-6 animate-slide-up">
          {/* Stream Player */}
          <Card className="overflow-hidden border-primary/30 card-glow bg-card/50 backdrop-blur-sm p-0">
            <div className="aspect-video relative group">
              <iframe
                src="https://player.kick.com/hadesost"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                scrolling="no"
                allowFullScreen={true}
                title="HadesOST Live Stream"
              />
            </div>
            <div className="p-4 bg-card/80 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-secondary">CANLI</span>
                </div>
                <a 
                  href="https://kick.com/hadesost" 
                  className="text-sm text-primary hover:text-primary-glow transition-colors font-medium flex items-center gap-2 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kick'te Aç
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </Card>
          
          {/* Chat */}
          <Card className="overflow-hidden border-primary/30 card-glow bg-card/50 backdrop-blur-sm lg:h-[720px] h-[500px] flex flex-col">
            <div className="p-4 bg-card/80 backdrop-blur border-b border-border/50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Canlı Sohbet
              </h3>
            </div>
            <div className="flex-1 relative">
              <iframe
                src="https://kick.com/popout/hadesost/chat"
                className="w-full h-full border-0"
                allowFullScreen
                title="HadesOST Chat"
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StreamSection;
