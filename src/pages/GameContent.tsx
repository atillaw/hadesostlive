import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Gamepad2, Trophy, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

const GameContent = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 glow-text">Oyun İçerikleri</h1>
          <p className="text-xl text-muted-foreground">
            Oyun dünyasından haberler, turnuvalar ve özel içerikler
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Gamepad2 className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-bold">Oynanılan Oyunlar</h3>
            </div>
            <p className="text-muted-foreground">
              En son oynanan ve yakında gelecek oyunlar hakkında bilgi edinin
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-bold">Turnuvalar</h3>
            </div>
            <p className="text-muted-foreground">
              Düzenlenen turnuvalara katılın ve ödüller kazanın
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-bold">Topluluk Etkinlikleri</h3>
            </div>
            <p className="text-muted-foreground">
              Topluluk ile birlikte oynanan özel etkinlikler
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-bold">Yayın Takvimi</h3>
            </div>
            <p className="text-muted-foreground">
              Hangi oyunların ne zaman yayınlanacağını öğrenin
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GameContent;
