import { Construction, Twitter, Instagram, Youtube, Twitch } from "lucide-react";
import { Card } from "@/components/ui/card";

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-8 animate-fade-in border-2">
        <div className="space-y-4">
          <Construction className="h-24 w-24 mx-auto text-primary animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold glow-text">
            Bakımdayız
          </h1>
          <p className="text-xl text-muted-foreground">
            Sitemiz şu anda bakımda. Daha iyi bir deneyim için çalışıyoruz.
          </p>
          <p className="text-sm text-muted-foreground">
            En kısa sürede geri döneceğiz. Anlayışınız için teşekkürler!
          </p>
        </div>

        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Bizi sosyal medyada takip edebilirsiniz:
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="https://twitter.com/hadesost"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-card hover:bg-primary/20 transition-all hover:scale-110 border"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="https://instagram.com/hadesost"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-card hover:bg-primary/20 transition-all hover:scale-110 border"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="https://youtube.com/@hadesost"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-card hover:bg-primary/20 transition-all hover:scale-110 border"
            >
              <Youtube className="h-6 w-6" />
            </a>
            <a
              href="https://kick.com/hadesost"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-card hover:bg-primary/20 transition-all hover:scale-110 border"
            >
              <Twitch className="h-6 w-6" />
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Maintenance;