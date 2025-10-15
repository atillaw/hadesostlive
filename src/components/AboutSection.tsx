import { Card } from "@/components/ui/card";
import { Gamepad2, Users, Radio } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-20 container mx-auto px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Hadesost Hakkında
        </h2>
        
        <Card className="p-8 mb-8 border-primary/20 card-glow">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Yeraltı dünyasına hoş geldiniz! Ben HadesOST, size kalbinizi hızlandıracak yüksek enerjili oyun yayınları sunuyorum. 
            İster roguelike oyunlarda grind yapıyor olun, ister yeni dünyaları keşfediyor olun ya da sadece harika müziklerle takılıyor olun, 
            burası kaliteli eğlence ve efsane bir topluluk için doğru adresiniz.
          </p>
        </Card>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Gaming Kartı */}
          <Card className="p-6 text-center border-primary/20 hover:border-primary/40 transition-all duration-300">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Oyun</h3>
            <p className="text-muted-foreground">
              Roguelike’lar, RPG’ler ve aradaki her şey
            </p>
          </Card>

          {/* Kick / İşbirliği Kartı */}
          <Card className="p-6 text-center border-primary/20 hover:border-primary/40 transition-all duration-300">
            <Radio className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-4">İşbirliği</h3>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Ortaklık ve işbirliği için:
              </p>
              <a 
                href="mailto:hadesost@gmail.com" 
                className="font-bold text-primary mt-1 inline-block hover:underline transition-all"
              >
                hadesost@gmail.com
              </a>
            </div>
          </Card>

          {/* Community Kartı */}
          <Card className="p-6 text-center border-primary/20 hover:border-primary/40 transition-all duration-300">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Topluluk</h3>
            <p className="text-muted-foreground">
              Eğlenceli Yayınların Adresi
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
