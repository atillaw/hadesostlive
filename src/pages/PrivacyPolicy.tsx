import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Gizlilik Politikası - HadesOST";
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-12 mt-20">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Gizlilik Politikası</CardTitle>
            <p className="text-muted-foreground">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Giriş</h2>
              <p className="text-muted-foreground">
                HadesOST olarak, kullanıcılarımızın gizliliğine saygı duyuyor ve kişisel verilerinizi korumak için 
                gereken tüm önlemleri alıyoruz. Bu gizlilik politikası, web sitemizi kullanırken toplanan bilgilerin 
                nasıl işlendiğini ve korunduğunu açıklamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Toplanan Bilgiler</h2>
              <h3 className="text-xl font-semibold mb-2">2.1. Otomatik Olarak Toplanan Bilgiler</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>IP adresi ve coğrafi konum bilgileri</li>
                <li>Tarayıcı türü ve versiyonu</li>
                <li>İşletim sistemi bilgileri</li>
                <li>Ziyaret edilen sayfalar ve harcanan süre</li>
                <li>Yönlendirme kaynağı (referrer URL)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">2.2. Kullanıcı Tarafından Sağlanan Bilgiler</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>E-posta adresi (abonelik için)</li>
                <li>Kullanıcı adı ve profil bilgileri (kayıt olunması durumunda)</li>
                <li>Yüklenen içerikler (klipler, memeler, yorumlar)</li>
                <li>İletişim formları aracılığıyla paylaşılan bilgiler</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Bilgilerin Kullanım Amaçları</h2>
              <p className="text-muted-foreground mb-2">Topladığımız bilgileri şu amaçlarla kullanırız:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Hizmetlerimizi sağlamak ve iyileştirmek</li>
                <li>Kullanıcı deneyimini kişiselleştirmek</li>
                <li>Teknik sorunları tespit etmek ve çözmek</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
                <li>İstatistiksel analiz ve raporlama</li>
                <li>Yasal yükümlülükleri yerine getirmek</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Çerezler ve Takip Teknolojileri</h2>
              <p className="text-muted-foreground mb-2">
                Sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanır:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Zorunlu Çerezler:</strong> Sitenin temel işlevselliği için gereklidir</li>
                <li><strong>Analitik Çerezler:</strong> Site kullanımını anlamak için kullanılır</li>
                <li><strong>Reklam Çerezleri:</strong> İlgili reklamları göstermek için kullanılır</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz. Ancak bazı çerezleri 
                devre dışı bırakmak, sitenin bazı özelliklerinin çalışmamasına neden olabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Google AdSense</h2>
              <p className="text-muted-foreground mb-2">
                Sitemizde Google AdSense reklamları gösterilmektedir. Google, ilgili reklamları sunmak için 
                çerezler kullanır. Google'ın gizlilik politikası hakkında daha fazla bilgi için:
              </p>
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://policies.google.com/privacy
              </a>
              <p className="text-muted-foreground mt-4">
                Kişiselleştirilmiş reklamları reddetmek için Google Reklam Ayarları'nı ziyaret edebilirsiniz:
              </p>
              <a 
                href="https://www.google.com/settings/ads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://www.google.com/settings/ads
              </a>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Veri Güvenliği</h2>
              <p className="text-muted-foreground">
                Verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri kullanıyoruz:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>SSL/TLS şifreleme</li>
                <li>Güvenli veri depolama</li>
                <li>Düzenli güvenlik denetimleri</li>
                <li>Erişim kontrolü ve kimlik doğrulama</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Veri Saklama Süresi</h2>
              <p className="text-muted-foreground">
                Kişisel verilerinizi, toplama amacını yerine getirmek için gerekli olan süre boyunca veya 
                yasal yükümlülüklerimiz gereği saklıyoruz. Hesabınızı sildiğinizde, verileriniz sistemimizden 
                kalıcı olarak silinir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Kullanıcı Hakları</h2>
              <p className="text-muted-foreground mb-2">Kullanıcılarımız şu haklara sahiptir:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Kişisel verilerinize erişim hakkı</li>
                <li>Verilerin düzeltilmesini isteme hakkı</li>
                <li>Verilerin silinmesini isteme hakkı</li>
                <li>Veri işlemeye itiraz etme hakkı</li>
                <li>Veri taşınabilirliği hakkı</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz: contact@hadesost.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Üçüncü Taraf Bağlantılar</h2>
              <p className="text-muted-foreground">
                Sitemiz, üçüncü taraf web sitelerine bağlantılar içerebilir. Bu sitelerin gizlilik 
                uygulamalarından sorumlu değiliz. Dış bağlantıları ziyaret ettiğinizde, ilgili sitenin 
                gizlilik politikasını incelemenizi öneririz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Çocukların Gizliliği</h2>
              <p className="text-muted-foreground">
                Hizmetlerimiz 13 yaşın altındaki çocuklara yönelik değildir. Bilerek 13 yaşın altındaki 
                çocuklardan kişisel bilgi toplamıyoruz. Ebeveynler, çocuklarının bu yaşın altında olması 
                durumunda bizimle iletişime geçmelidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Değişiklikler</h2>
              <p className="text-muted-foreground">
                Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda, 
                sitemizde bir bildirim yayınlayacağız. Politikayı düzenli olarak gözden geçirmenizi öneririz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. İletişim</h2>
              <p className="text-muted-foreground">
                Gizlilik politikamız hakkında sorularınız veya endişeleriniz varsa, lütfen bizimle iletişime geçin:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground mt-4">
                <li><strong>E-posta:</strong> contact@hadesost.com</li>
                <li><strong>Web:</strong> hadesost.com</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
