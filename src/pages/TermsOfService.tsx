import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  useEffect(() => {
    document.title = "Kullanım Koşulları - HadesOST";
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-12 mt-20">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Kullanım Koşulları</CardTitle>
            <p className="text-muted-foreground">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Hizmet Şartları</h2>
              <p className="text-muted-foreground">
                HadesOST web sitesini kullanarak, aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız. 
                Bu koşulları kabul etmiyorsanız, lütfen sitemizi kullanmayın.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Hizmet Tanımı</h2>
              <p className="text-muted-foreground mb-2">
                HadesOST, kullanıcılara aşağıdaki hizmetleri sunar:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Canlı yayın içeriği ve arşivleri (VOD)</li>
                <li>Klip ve video paylaşım platformu</li>
                <li>Topluluk etkileşim araçları</li>
                <li>Meme galerisi ve içerik paylaşımı</li>
                <li>Yayın programı ve bildirimler</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Kullanıcı Sorumlulukları</h2>
              <h3 className="text-xl font-semibold mb-2">3.1. Kabul Edilebilir Kullanım</h3>
              <p className="text-muted-foreground mb-2">Kullanıcılar şunları yapmamayı kabul eder:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Yasadışı içerik paylaşmak</li>
                <li>Telif hakkı ihlali yapacak içerik yüklemek</li>
                <li>Taciz, nefret söylemi veya ayrımcılık içeren içerik paylaşmak</li>
                <li>Zararlı yazılım veya virüs yaymak</li>
                <li>Başkalarının hesaplarına yetkisiz erişim sağlamaya çalışmak</li>
                <li>Spam veya istenmeyen toplu mesaj göndermek</li>
                <li>Sitenin güvenliğini veya işlevselliğini tehlikeye atmak</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">3.2. İçerik Standartları</h3>
              <p className="text-muted-foreground">
                Paylaşılan tüm içerikler, Türkiye Cumhuriyeti yasalarına ve topluluk kurallarına uygun olmalıdır. 
                Uygunsuz içerik tespit edildiğinde, uyarı vermeksizin kaldırılabilir ve ilgili hesap askıya alınabilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Fikri Mülkiyet Hakları</h2>
              <h3 className="text-xl font-semibold mb-2">4.1. Site İçeriği</h3>
              <p className="text-muted-foreground">
                HadesOST web sitesindeki tüm içerik, tasarım, logo, grafik ve yazılım telif hakkı yasaları 
                ile korunmaktadır. İzinsiz kullanım, kopyalama veya dağıtım yasaktır.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-4">4.2. Kullanıcı İçeriği</h3>
              <p className="text-muted-foreground">
                Kullanıcılar, yükledikleri içeriğin telif haklarına sahip olduklarını veya paylaşım için 
                gerekli izinlere sahip olduklarını beyan ederler. Yüklenen içerikler üzerindeki haklar 
                kullanıcıya aittir, ancak HadesOST, bu içerikleri platformda sergilemek ve tanıtmak için 
                sınırlı bir lisansa sahiptir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Hesap Güvenliği</h2>
              <p className="text-muted-foreground">
                Kullanıcılar, hesap bilgilerini gizli tutmaktan sorumludur. Hesabınızda yetkisiz bir 
                aktivite fark ederseniz, derhal bizimle iletişime geçin. Hesap güvenliği ihlallerinden 
                kullanıcı sorumludur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Hizmet Kesintileri</h2>
              <p className="text-muted-foreground">
                HadesOST, hizmetlerin kesintisiz veya hatasız olacağını garanti etmez. Bakım, güncellemeler 
                veya teknik sorunlar nedeniyle hizmetler geçici olarak kesintiye uğrayabilir. Bu tür 
                kesintilerden sorumlu değiliz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Üçüncü Taraf Hizmetler</h2>
              <p className="text-muted-foreground">
                Sitemiz, üçüncü taraf hizmetler ve bağlantılar içerebilir (örneğin: Twitch, YouTube, Google AdSense). 
                Bu hizmetlerin kullanımı, ilgili üçüncü tarafın kendi şartlarına tabidir. Üçüncü taraf 
                hizmetlerinin içeriğinden veya politikalarından sorumlu değiliz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Reklamlar</h2>
              <p className="text-muted-foreground">
                HadesOST, ücretsiz hizmet sunabilmek için reklam gelirlerine dayanmaktadır. Reklam engelleme 
                yazılımlarının kullanımı, sitenin tam işlevselliğini etkileyebilir. Reklamların içeriğinden 
                veya yönlendirdiği sitelerden sorumlu değiliz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Sorumluluk Reddi</h2>
              <p className="text-muted-foreground mb-2">
                HadesOST hizmetleri "olduğu gibi" sunulmaktadır. Şunlar için sorumluluk kabul etmiyoruz:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Kullanıcı içeriğinin doğruluğu veya yasallığı</li>
                <li>Hizmet kesintilerinden kaynaklanan kayıplar</li>
                <li>Üçüncü taraf bağlantılar veya hizmetler</li>
                <li>Veri kaybı veya güvenlik ihlalleri</li>
                <li>Kullanıcılar arasındaki anlaşmazlıklar</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Hesap Askıya Alma ve Sonlandırma</h2>
              <p className="text-muted-foreground">
                Bu kullanım koşullarını ihlal eden kullanıcıların hesapları, uyarı vermeksizin askıya 
                alınabilir veya kalıcı olarak kapatılabilir. Ayrıca, herhangi bir nedenle dilediğimiz zaman 
                hizmeti sonlandırma hakkını saklı tutuyoruz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Değişiklikler</h2>
              <p className="text-muted-foreground">
                Bu kullanım koşullarını herhangi bir zamanda değiştirme hakkını saklı tutuyoruz. Önemli 
                değişiklikler olduğunda, sitemizde bir bildirim yayınlayacağız. Güncellemelerden sonra 
                siteyi kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Uygulanacak Hukuk</h2>
              <p className="text-muted-foreground">
                Bu kullanım koşulları, Türkiye Cumhuriyeti yasalarına tabidir. Herhangi bir anlaşmazlık 
                durumunda, Türkiye mahkemeleri yetkilidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. İletişim</h2>
              <p className="text-muted-foreground">
                Kullanım koşulları hakkında sorularınız varsa, bizimle iletişime geçin:
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

export default TermsOfService;
