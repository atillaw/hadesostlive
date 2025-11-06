import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CookiePolicy = () => {
  useEffect(() => {
    document.title = "Çerez Politikası - HadesOST";
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Çerez Politikası - HadesOST</title>
        <meta name="description" content="HadesOST çerez politikası. Web sitemizde kullanılan çerezler ve nasıl yönetileceği hakkında bilgi." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <Navigation />
      <main className="container mx-auto px-4 py-12 mt-20">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Çerez Politikası</CardTitle>
            <p className="text-muted-foreground">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Çerezler Nedir?</h2>
              <p className="text-muted-foreground">
                Çerezler, bir web sitesini ziyaret ettiğinizde cihazınıza (bilgisayar, telefon, tablet) 
                kaydedilen küçük metin dosyalarıdır. Çerezler, web sitelerinin daha verimli çalışmasını 
                sağlar ve kullanıcı deneyimini iyileştirir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Çerez Türleri</h2>
              
              <h3 className="text-xl font-semibold mb-2">2.1. Zorunlu Çerezler</h3>
              <p className="text-muted-foreground mb-2">
                Bu çerezler, web sitesinin temel işlevlerini yerine getirmesi için gereklidir:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Oturum Çerezleri:</strong> Giriş durumunuzu ve tercihlerinizi hatırlar</li>
                <li><strong>Güvenlik Çerezleri:</strong> Güvenli oturum açma ve kimlik doğrulaması sağlar</li>
                <li><strong>Yük Dengeleme:</strong> Sunucu yükünü dağıtmak için kullanılır</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">2.2. İşlevsellik Çerezleri</h3>
              <p className="text-muted-foreground mb-2">
                Tercihlerinizi hatırlayarak daha iyi bir deneyim sunar:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Dil ve bölge tercihleri</li>
                <li>Tema ayarları (karanlık/aydınlık mod)</li>
                <li>Video oynatıcı ayarları</li>
                <li>Kullanıcı arabirimi tercihleri</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">2.3. Performans Çerezleri</h3>
              <p className="text-muted-foreground mb-2">
                Site kullanımını analiz ederek performansı artırır:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Sayfa yükleme süreleri</li>
                <li>En çok ziyaret edilen sayfalar</li>
                <li>Kullanıcı davranış analizi</li>
                <li>Hata raporlama</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">2.4. Hedefleme/Reklam Çerezleri</h3>
              <p className="text-muted-foreground mb-2">
                İlgi alanlarınıza uygun reklamlar göstermek için kullanılır:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Google AdSense çerezleri</li>
                <li>Reklam frekans kontrolü</li>
                <li>Reklam etkinliği ölçümü</li>
                <li>Kişiselleştirilmiş reklam içeriği</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Kullandığımız Spesifik Çerezler</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-4 py-2 text-left">Çerez Adı</th>
                      <th className="border border-border px-4 py-2 text-left">Tür</th>
                      <th className="border border-border px-4 py-2 text-left">Süre</th>
                      <th className="border border-border px-4 py-2 text-left">Amaç</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-4 py-2">session_id</td>
                      <td className="border border-border px-4 py-2">Zorunlu</td>
                      <td className="border border-border px-4 py-2">Oturum</td>
                      <td className="border border-border px-4 py-2">Kullanıcı oturum yönetimi</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">user_preferences</td>
                      <td className="border border-border px-4 py-2">İşlevsel</td>
                      <td className="border border-border px-4 py-2">1 yıl</td>
                      <td className="border border-border px-4 py-2">Kullanıcı tercihlerini saklar</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">_ga</td>
                      <td className="border border-border px-4 py-2">Analitik</td>
                      <td className="border border-border px-4 py-2">2 yıl</td>
                      <td className="border border-border px-4 py-2">Google Analytics kullanıcı tanımlama</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">_gid</td>
                      <td className="border border-border px-4 py-2">Analitik</td>
                      <td className="border border-border px-4 py-2">24 saat</td>
                      <td className="border border-border px-4 py-2">Google Analytics oturum tanımlama</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">DSID</td>
                      <td className="border border-border px-4 py-2">Reklam</td>
                      <td className="border border-border px-4 py-2">2 hafta</td>
                      <td className="border border-border px-4 py-2">Google AdSense reklam hedefleme</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">IDE</td>
                      <td className="border border-border px-4 py-2">Reklam</td>
                      <td className="border border-border px-4 py-2">1 yıl</td>
                      <td className="border border-border px-4 py-2">Google DoubleClick reklam ID</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Üçüncü Taraf Çerezleri</h2>
              
              <h3 className="text-xl font-semibold mb-2">4.1. Google AdSense</h3>
              <p className="text-muted-foreground mb-2">
                Sitemizde Google AdSense reklamları gösterilmektedir. Google, reklamları kişiselleştirmek 
                için çerezler kullanır. Daha fazla bilgi için:
              </p>
              <a 
                href="https://policies.google.com/technologies/ads" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Reklam Teknolojileri
              </a>

              <h3 className="text-xl font-semibold mb-2 mt-4">4.2. Analitik Hizmetler</h3>
              <p className="text-muted-foreground">
                Site performansını ve kullanımını anlamak için analitik hizmetler kullanıyoruz. Bu hizmetler 
                anonim kullanım verileri toplar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Çerezleri Yönetme</h2>
              
              <h3 className="text-xl font-semibold mb-2">5.1. Tarayıcı Ayarları</h3>
              <p className="text-muted-foreground mb-2">
                Çoğu web tarayıcısı, çerezleri otomatik olarak kabul eder, ancak tarayıcı ayarlarınızdan 
                çerezleri yönetebilirsiniz:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler</li>
                <li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler</li>
                <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler</li>
                <li><strong>Edge:</strong> Ayarlar → Gizlilik → Çerezler</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">5.2. Reklam Çerezlerini Devre Dışı Bırakma</h3>
              <p className="text-muted-foreground mb-2">
                Kişiselleştirilmiş reklamları reddetmek için:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <a 
                    href="https://www.google.com/settings/ads" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Reklam Ayarları
                  </a>
                </li>
                <li>
                  <a 
                    href="http://www.youronlinechoices.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Your Online Choices
                  </a>
                </li>
              </ul>

              <p className="text-muted-foreground mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <strong>Önemli:</strong> Çerezleri devre dışı bırakmak, sitenin bazı özelliklerinin 
                çalışmamasına neden olabilir. Zorunlu çerezleri devre dışı bırakmak, siteyi kullanmanızı 
                engelleyebilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Çerez Saklama Süreleri</h2>
              <p className="text-muted-foreground mb-2">Çerezler, türlerine göre farklı sürelerde saklanır:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Oturum Çerezleri:</strong> Tarayıcıyı kapattığınızda silinir</li>
                <li><strong>Kalıcı Çerezler:</strong> Belirlenen süre boyunca (genellikle 1-2 yıl) saklanır</li>
                <li><strong>Güvenlik Çerezleri:</strong> 30 gün</li>
                <li><strong>Tercih Çerezleri:</strong> 1 yıl</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Güncellemeler</h2>
              <p className="text-muted-foreground">
                Bu çerez politikasını düzenli olarak güncelleyebiliriz. Değişiklikler bu sayfada 
                yayınlanacaktır. Önemli değişiklikler olduğunda, sitemizde bir bildirim gösterilecektir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. İletişim</h2>
              <p className="text-muted-foreground">
                Çerez politikası hakkında sorularınız varsa, bizimle iletişime geçin:
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

export default CookiePolicy;
