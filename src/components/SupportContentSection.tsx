import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Heart, Users, Zap, Shield } from "lucide-react";
import AdSenseUnit from "@/components/AdSenseUnit";
import CustomAdUnit from "@/components/CustomAdUnit";

const SupportContentSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 space-y-8">
        {/* Platform Info */}
        <Card className="bg-card/50 backdrop-blur border-border card-glow">
          <CardHeader>
            <CardTitle className="text-3xl font-bold glow-text mb-4">
              Platformumuz Hakkında
            </CardTitle>
            <CardDescription className="text-lg">
              İçerik üreticileri ve topluluk üyeleri için tamamen ücretsiz bir hizmet sunuyoruz. 
              Desteğiniz sayesinde bu hizmeti sürdürmeye devam edebiliyoruz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
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

            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Sunduğumuz Hizmetler
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>VOD Sistemi:</strong> Canlı yayınların kaydedilmesi ve arşivlenmesi</li>
                <li>• <strong>Klip Yönetimi:</strong> En iyi anların kolay paylaşımı</li>
                <li>• <strong>Topluluk Özellikleri:</strong> Oylama, yorum ve etkileşim</li>
                <li>• <strong>AI Destekli Araçlar:</strong> İçerik analizi ve öneriler</li>
                <li>• <strong>Abone Takibi:</strong> İstatistikler ve analitikler</li>
              </ul>
            </div>

            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Ücretsiz Hizmet:</strong> Platformumuz tamamen ücretsizdir ve ücretsiz kalmaya devam edecektir. 
                Reklamlar sayesinde tüm özelliklere hiçbir ücret ödemeden erişebilirsiniz.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Ad Section */}
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Destekçi Ortaklarımız</CardTitle>
            <CardDescription>
              Bu reklamlar sayesinde size ücretsiz hizmet sunmaya devam edebiliyoruz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Custom HTML Ad */}
            <div className="p-6 border border-border/50 rounded-lg bg-muted/30 min-h-[250px] flex items-center justify-center">
              <CustomAdUnit className="w-full" />
            </div>

            {/* AdSense Unit */}
            <div className="p-6 border border-border/50 rounded-lg bg-muted/30 min-h-[250px] flex items-center justify-center">
              <AdSenseUnit 
                format="auto"
                fullWidthResponsive={true}
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Reklam engelleyici kullanıyorsanız, bu reklamlar görünmeyebilir. 
                Platformumuzu desteklemek için lütfen reklam engelleyiciyi devre dışı bırakın.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SupportContentSection;
