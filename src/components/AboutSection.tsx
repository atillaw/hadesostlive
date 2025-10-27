import { Card } from "@/components/ui/card";
import { Gamepad2, Users, Radio } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-16 md:py-24 container mx-auto px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">
            Hadesost Hakkında
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Yeraltı dünyasının efsanevi yayıncısı
          </p>
        </div>
        
        <Card className="snow-accent p-6 md:p-8 lg:p-10 mb-8 border-primary/30 card-glow bg-card/50 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Yeraltı dünyasına hoş geldiniz! Ben HadesOST, size kalbinizi hızlandıracak yüksek enerjili oyun yayınları sunuyorum. 
            İster roguelike oyunlarda grind yapıyor olun, ister yeni dünyaları keşfediyor olun ya da sadece harika müziklerle takılıyor olun, 
            burası kaliteli eğlence ve efsane bir topluluk için doğru adresiniz.
          </p>
        </Card>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="snow-accent group p-6 text-center border-primary/30 hover:border-primary/60 transition-all duration-300 card-glow bg-card/50 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Oyun</h3>
            <p className="text-muted-foreground">
              Roguelike'lar, RPG'ler ve aradaki her şey
            </p>
          </Card>

          <Card className="snow-accent group p-6 text-center border-primary/30 hover:border-primary/60 transition-all duration-300 card-glow bg-card/50 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Radio className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-4">İşbirliği</h3>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 hover:bg-primary/15 transition-colors">
              <p className="text-sm text-muted-foreground mb-2">
                Ortaklık ve işbirliği için:
              </p>
              <a 
                href="mailto:hadesost@gmail.com" 
                className="font-bold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all group/link"
              >
                hadesost@gmail.com
                <svg className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </Card>

          <Card className="snow-accent group p-6 text-center border-primary/30 hover:border-primary/60 transition-all duration-300 card-glow bg-card/50 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Users className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
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
