import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Shield, AlertCircle, Users, MessageSquare, ThumbsDown } from "lucide-react";

const ForumRules = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="page-content">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            Forum Kuralları ve Rehberi
          </h1>
          <p className="text-muted-foreground text-lg">
            Topluluk üyelerimizin güvenli ve saygılı bir ortamda etkileşime geçmesi için oluşturulmuş kurallar ve yönergeler.
          </p>
        </div>

        <div className="space-y-6">
          {/* Genel Kurallar */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">1. Genel Kurallar</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Saygılı olun:</strong> Tüm üyelere saygı gösterin. Hakaret, aşağılama veya kişisel saldırılar yasaktır.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Spam yapmayın:</strong> Gereksiz tekrarlayan içerik, reklam veya alakasız bağlantılar paylaşmayın.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Doğru toplulukta paylaşın:</strong> İçeriğinizi ilgili topluluğa gönderin.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Türkçe kullanın:</strong> Ana dilimiz Türkçe'dir, lütfen Türkçe içerik paylaşın.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* İçerik Kuralları */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">2. İçerik Kuralları</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Yasal içerik:</strong> Yasa dışı içerik paylaşmayın (telif ihlali, yasadışı faaliyetler vb.).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>NSFW işaretleme:</strong> Hassas içerik paylaşıyorsanız uygun etiketleri kullanın.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Başlıklar açık olsun:</strong> Gönderi başlıklarınız içeriği net bir şekilde yansıtmalıdır.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Orijinal içerik:</strong> Başkalarının içeriğini kendi içeriğiniz gibi göstermeyin.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Kaliteli tartışma:</strong> Yapıcı ve düşünceli yorumlar paylaşın.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yasak Davranışlar */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <ThumbsDown className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">3. Yasak Davranışlar</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span><strong>Nefret söylemi:</strong> Irk, din, cinsiyet, cinsel yönelim veya başka özelliklere dayalı ayrımcılık kesinlikle yasaktır.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span><strong>Taciz:</strong> Kullanıcıları rahatsız etmeyin, takip etmeyin veya hedef almayın.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span><strong>Doxxing:</strong> Kişisel bilgileri izinsiz paylaşmayın.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span><strong>Vote manipulation:</strong> Sahte hesaplarla oy manipülasyonu yapmayın.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span><strong>Trolling:</strong> Kasıtlı olarak tartışmayı bozmayın veya provokasyon yapmayın.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Moderasyon */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">4. Moderasyon ve Yaptırımlar</h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>İlk uyarı:</strong> Küçük ihlaller için moderatörler uyarı verebilir.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Geçici ban:</strong> Tekrarlayan ihlaller geçici hesap askıya alınması ile sonuçlanabilir (1-30 gün).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Kalıcı ban:</strong> Ciddi veya sürekli ihlaller kalıcı hesap kapatılmasına yol açabilir.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>İçerik silme:</strong> Kurallara aykırı içerikler uyarı olmadan silinebilir.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Raporlama:</strong> Kural ihlallerini "Rapor Et" butonu ile bildirebilirsiniz.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* En İyi Uygulamalar */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">5. En İyi Uygulamalar</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Kaynak belirtin ve çalınmış içerikten kaçının</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Arama yapın - benzer gönderiler zaten yapılmış olabilir</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Yapıcı eleştiri sunun, sadece olumsuz yorum yapmayın</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Flair'leri (etiketleri) doğru kullanın</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Kaliteli tartışmaya katkıda bulunun</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Yanlış bilgi yaymayın, doğruluğu kontrol edin</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Yardım */}
          <Card className="bg-primary/5">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-3">Yardıma mı ihtiyacınız var?</h2>
              <p className="text-muted-foreground mb-4">
                Sorularınız veya endişeleriniz varsa, moderasyon ekibimizle iletişime geçebilirsiniz.
                Önemli sorunlar için lütfen destek sistemimizi kullanın.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Not:</strong> Bu kurallar zaman içinde güncellenebilir. Lütfen düzenli olarak kontrol edin.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForumRules;
