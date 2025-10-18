import { Gamepad2, Twitch, Youtube } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Games = () => {
  const games = [
    {
      title: "League of Legends",
      description: "MOBA oyunu yayınları ve destansı anlar",
      platform: "Kick",
      icon: Twitch,
    },
    {
      title: "Valorant",
      description: "Taktiksel FPS oynanışları",
      platform: "Kick",
      icon: Twitch,
    },
    {
      title: "CS:GO",
      description: "Klasik FPS maceraları",
      platform: "Kick",
      icon: Twitch,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold glow-text">Oyun İçerikleri</h1>
          </div>
          <p className="text-muted-foreground">
            Tüm oyun yayınları ve içerikleri burada
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <game.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                  <p className="text-muted-foreground mb-4">{game.description}</p>
                  <Button size="sm" variant="outline">
                    <Twitch className="mr-2 h-4 w-4" />
                    {game.platform}'te İzle
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Games;
