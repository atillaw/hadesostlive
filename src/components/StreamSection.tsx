import { Card } from "@/components/ui/card";

const StreamSection = () => {
  return (
    <section className="py-20 container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Live Stream
        </h2>
        
        <Card className="overflow-hidden border-primary/20 card-glow">
          <div className="aspect-video bg-muted">
            <iframe
              src="https://player.kick.com/hadesost"
              height="720"
              width="1280"
              className="w-full h-full"
              frameBorder="0"
              scrolling="no"
              allowFullScreen={true}
              title="HadesOST Live Stream"
            />
          </div>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <a 
            href="https://kick.com/hadesost" 
            className="text-primary hover:underline text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch on Kick
          </a>
          <span className="hidden sm:inline text-muted-foreground">•</span>
          <a 
            href="https://kick.com/popout/hadesost/chat" 
            className="text-primary hover:underline text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Chat
          </a>
        </div>
      </div>
    </section>
  );
};

export default StreamSection;
