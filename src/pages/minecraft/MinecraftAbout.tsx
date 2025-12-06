import { Users, Shield, Heart, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MinecraftNavbar from '@/components/minecraft/MinecraftNavbar';
import MinecraftFooter from '@/components/minecraft/MinecraftFooter';

const MinecraftAbout = () => {
  return (
    <div className="min-h-screen bg-background">
      <MinecraftNavbar />
      
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">
            Hakkımızda
          </h1>
          <p className="text-muted-foreground text-lg text-center mb-12">
            HadesOst, Türkiye'nin en köklü ve güvenilir Minecraft topluluklarından biridir.
          </p>

          {/* Story Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-border mb-12">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-emerald-500 mb-4">Hikayemiz</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                HadesOst, 2020 yılında küçük bir arkadaş grubu tarafından kuruldu. Amacımız, 
                Türkiye'deki Minecraft oyuncularına güvenli, eğlenceli ve adil bir oyun ortamı 
                sunmaktı.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Yıllar içinde büyüyerek binlerce oyuncunun bir araya geldiği, dostlukların 
                kurulduğu ve unutulmaz anıların yaşandığı bir topluluk haline geldik.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Bugün, deneyimli ekibimiz ve sürekli güncellenen sunucumuzla, 
                Minecraft deneyiminizi en üst seviyeye taşımak için çalışmaya devam ediyoruz.
              </p>
            </CardContent>
          </Card>

          {/* Values */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: Shield,
                title: 'Güvenlik',
                desc: 'Anti-cheat sistemleri ve aktif moderasyon ile adil oyun ortamı sağlıyoruz.',
              },
              {
                icon: Users,
                title: 'Topluluk',
                desc: 'Samimi ve yardımsever topluluğumuzla her zaman yanınızdayız.',
              },
              {
                icon: Heart,
                title: 'Tutku',
                desc: 'Minecraft\'a olan tutkumuzu her güncellemede ve etkinlikte yaşatıyoruz.',
              },
              {
                icon: Clock,
                title: '7/24 Aktif',
                desc: 'Sunucumuz kesintisiz çalışır, istediğiniz zaman katılabilirsiniz.',
              },
            ].map((value) => (
              <Card 
                key={value.title}
                className="bg-card/50 backdrop-blur-sm border-border hover:border-emerald-500/50 transition-colors"
              >
                <CardContent className="pt-6">
                  <value.icon className="w-10 h-10 text-emerald-500 mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Team */}
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-emerald-500 mb-6 text-center">Ekibimiz</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { name: 'HadesOst', role: 'Kurucu', skin: 'HadesOst' },
                  { name: 'Admin1', role: 'Admin', skin: 'Notch' },
                  { name: 'Mod1', role: 'Moderatör', skin: 'jeb_' },
                ].map((member) => (
                  <div key={member.name} className="text-center">
                    <img
                      src={`https://minotar.net/helm/${member.skin}/80.png`}
                      alt={member.name}
                      className="mx-auto mb-3 rounded-lg"
                    />
                    <p className="font-semibold text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <MinecraftFooter />
    </div>
  );
};

export default MinecraftAbout;
