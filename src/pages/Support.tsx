import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Heart, Users, Zap, Target, TrendingUp, Shield } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AdSenseUnit from "@/components/AdSenseUnit";
import CustomAdUnit from "@/components/CustomAdUnit";

const SupportPage = () => {

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>Destek Ol - HadesOST | Projeyi Destekle</title>
        <meta name="description" content="HadesOST projesini destekleyerek ücretsiz hizmetlerimizin devamına katkıda bulunun. Reklamlarla destekleyin." />
        <meta property="og:title" content="Destek Ol - HadesOST" />
        <meta property="og:description" content="Projeyi destekleyerek ücretsiz hizmetlerimizin devamına katkıda bulunun." />
        <meta name="twitter:title" content="Destek Ol - HadesOST" />
        <meta name="twitter:description" content="Projeyi destekleyerek ücretsiz hizmetlerimizin devamına katkıda bulunun." />
      </Helmet>
      <Navigation />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-8 space-y-8">
        {/* Hero Section */}
        <Card className="bg-card/50 backdrop-blur border-border card-glow">
          <CardHeader>
            <CardTitle className="text-4xl font-bold glow-text mb-4">
              Projeyi Destekleyin
            </CardTitle>
            <CardDescription className="text-lg">
              Bu platform, içerik üreticileri ve topluluk üyeleri için tamamen ücretsiz bir hizmet sunmaktadır. 
              Sizlerin desteği sayesinde bu hizmeti sürdürmeye ve geliştirmeye devam edebiliyoruz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                Neden Desteğiniz Önemli?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Platformumuz, içerik üreticilerin videolarını paylaşması, topluluk üyelerinin etkileşimde bulunması 
                ve herkesin kaliteli içeriklere kolayca ulaşması için geliştirilmiştir. Sunduğumuz hizmetler arasında:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>VOD (Video On Demand) Sistemi:</strong> Canlı yayınların kaydedilmesi ve arşivlenmesi</li>
                <li>• <strong>Klip Yönetimi:</strong> En iyi anların kolay paylaşımı ve keşfi</li>
                <li>• <strong>Topluluk Özellikleri:</strong> Oylama, yorum ve etkileşim sistemleri</li>
                <li>• <strong>AI Destekli Araçlar:</strong> İçerik analizi ve öneriler</li>
                <li>• <strong>Abone Takibi:</strong> İstatistikler ve analitikler</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-3 gap-4 my-8">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Topluluk Odaklı</h3>
                <p className="text-sm text-muted-foreground">
                  Kullanıcı deneyimi ve topluluk geri bildirimleri önceliğimizdir
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <Zap className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Sürekli Geliştirme</h3>
                <p className="text-sm text-muted-foreground">
                  Yeni özellikler ve iyileştirmeler düzenli olarak eklenmektedir
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Güvenilir Altyapı</h3>
                <p className="text-sm text-muted-foreground">
                  Verileriniz güvenli sunucularda korunmaktadır
                </p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Destekleriniz Nasıl Kullanılıyor?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Reklamlardan elde edilen gelirler, platformun işletim maliyetlerini karşılamak için kullanılmaktadır:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Sunucu ve Hosting Maliyetleri:</strong> Yüksek performanslı sunucular ve CDN hizmetleri</li>
                <li>• <strong>Video Depolama:</strong> Binlerce saatlik video içeriğinin güvenli saklanması</li>
                <li>• <strong>Bant Genişliği:</strong> Hızlı ve kesintisiz video akışı için gerekli altyapı</li>
                <li>• <strong>Geliştirme:</strong> Yeni özellikler ve hata düzeltmeleri</li>
                <li>• <strong>Güvenlik:</strong> Veri güvenliği ve DDoS koruması</li>
              </ul>
            </div>

            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-base">
                <strong>Şeffaflık Taahhüdümüz:</strong> Platformumuz kar amacı gütmeyen bir proje olarak yürütülmektedir. 
                Tüm gelirler, hizmet kalitesini artırmak ve yeni özellikler eklemek için kullanılmaktadır.
              </AlertDescription>
            </Alert>

            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Gelecek Planlarımız
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Desteğiniz sayesinde şu özellikleri geliştirmeyi planlıyoruz:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li>• <strong>Mobil Uygulama:</strong> iOS ve Android için native uygulamalar</li>
                <li>• <strong>Gelişmiş Arama:</strong> AI destekli içerik keşfi ve öneri sistemi</li>
                <li>• <strong>Canlı Bildirimler:</strong> Favori yayıncılarınız için anlık bildirimler</li>
                <li>• <strong>Sosyal Özellikler:</strong> Profil sistemi ve kullanıcı etkileşimleri</li>
                <li>• <strong>4K Video Desteği:</strong> Daha yüksek çözünürlükte video depolama</li>
                <li>• <strong>API Entegrasyonları:</strong> Diğer platformlarla daha iyi entegrasyon</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Ad Section with Context */}
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Destekçi Ortaklarımız</CardTitle>
            <CardDescription>
              Platformumuzu destekleyen iş ortaklarımızın reklamlarını görerek, onların da büyümesine katkıda bulunabilirsiniz.
              Bu reklamlar sayesinde size ücretsiz hizmet sunmaya devam edebiliyoruz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                <strong>Reklam politikası:</strong> Sadece güvenilir ve kullanıcı dostu reklamlar gösterilmektedir. 
                Herhangi bir rahatsız edici reklam görmeniz durumunda, lütfen bizimle iletişime geçin.
              </p>
            </div>

            {/* Custom HTML Ad */}
            <div className="p-6 border border-border/50 rounded-lg bg-muted/30 min-h-[250px] flex items-center justify-center">
              <CustomAdUnit className="w-full" />
            </div>

            {/* AdSense Unit */}
            <div className="p-6 border border-border/50 rounded-lg bg-muted/30 min-h-[250px] flex items-center justify-center">
              <AdSenseUnit 
                client="ca-pub-3351860625616672"
                slot="4713366700"
                format="auto"
                fullWidthResponsive={true}
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Reklam engelleyici kullanıyorsanız, bu reklamlar görünmeyebilir. 
                Platformumuzu desteklemek için lütfen bu sayfa için reklam engelleyiciyi devre dışı bırakın.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Additional Value Content */}
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Sıkça Sorulan Sorular</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Platform tamamen ücretsiz mi?</h3>
                <p className="text-muted-foreground">
                  Evet, platformumuz tamamen ücretsizdir ve ücretsiz kalmaya devam edecektir. 
                  Reklamlar sayesinde tüm özelliklere hiçbir ücret ödemeden erişebilirsiniz.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Reklamsız deneyim mümkün mü?</h3>
                <p className="text-muted-foreground">
                  Şu anda reklamsız bir seçenek sunmuyoruz, ancak gelecekte premium üyelik sistemi 
                  üzerinde çalışıyoruz. Bu sayede destekçilerimize ek özellikler sunabileceğiz.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Verilerim güvende mi?</h3>
                <p className="text-muted-foreground">
                  Kesinlikle. Tüm kullanıcı verileri şifrelenmiş ve güvenli sunucularda saklanmaktadır. 
                  Kişisel bilgileriniz asla üçüncü taraflarla paylaşılmaz.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Nasıl geri bildirimde bulunabilirim?</h3>
                <p className="text-muted-foreground">
                  Önerilerinizi ve geri bildirimlerinizi bizimle paylaşmaktan çekinmeyin. 
                  Topluluk sayfamız üzerinden veya iletişim formumuz aracılığıyla bize ulaşabilirsiniz.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SupportPage;
