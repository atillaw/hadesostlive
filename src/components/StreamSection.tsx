import { Card } from "@/components/ui/card";

const StreamSection = () => {
  return (
    <section className="py-20 container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Live Stream
        </h2>
        
        <Card className="overflow-hidden border-primary/20 card-glow">
          <div className="aspect-video bg-muted flex items-center justify-center">
            {/* Replace with actual Kick embed iframe */}
            <iframe
              src="https://player.kick.com/hadesost"
              className="w-full h-full"
              allowFullScreen
              title="HadesOST Live Stream"
            />
            {/* Fallback if embed doesn't work */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm">
              <p className="text-muted-foreground mb-4">Stream embed will appear here</p>
              <p className="text-sm text-muted-foreground">
                Replace the iframe src with your actual Kick channel embed URL
              </p>
            </div>
          </div>
        </Card>
        
        <p className="text-center text-muted-foreground mt-6">
          Can't see the stream? <a href="https://kick.com/hadesost" className="text-primary hover:underline">Watch on Kick</a>
        </p>
      </div>
    </section>
  );
};

export default StreamSection;
