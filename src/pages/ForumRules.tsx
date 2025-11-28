import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Shield, AlertCircle, Users, MessageSquare, ThumbsDown, CheckCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

const ForumRules = () => {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const toggleSection = (section: number) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="page-content">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Forum Kuralları ve Rehberi
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Topluluk üyelerimizin güvenli ve saygılı bir ortamda etkileşime geçmesi için oluşturulmuş kurallar ve yönergeler.
          </p>
        </div>

        <div className="space-y-4">
          {/* Genel Kurallar */}
          <Collapsible open={openSections[1]} onOpenChange={() => toggleSection(1)}>
            <Card className="overflow-hidden border-l-4 border-l-primary">
              <CollapsibleTrigger className="w-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">1. Genel Kurallar</h2>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections[1] ? 'rotate-180' : ''}`} />
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0">
                  <ul className="space-y-4 ml-14">
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Saygılı olun:</strong>
                        <span className="text-muted-foreground"> Tüm üyelere saygı gösterin. Hakaret, aşağılama veya kişisel saldırılar yasaktır.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Spam yapmayın:</strong>
                        <span className="text-muted-foreground"> Gereksiz tekrarlayan içerik, reklam veya alakasız bağlantılar paylaşmayın.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Doğru toplulukta paylaşın:</strong>
                        <span className="text-muted-foreground"> İçeriğinizi ilgili topluluğa gönderin.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Türkçe kullanın:</strong>
                        <span className="text-muted-foreground"> Ana dilimiz Türkçe'dir, lütfen Türkçe içerik paylaşın.</span>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* İçerik Kuralları */}
          <Collapsible open={openSections[2]} onOpenChange={() => toggleSection(2)}>
            <Card className="overflow-hidden border-l-4 border-l-blue-500">
              <CollapsibleTrigger className="w-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl">
                        <MessageSquare className="h-6 w-6 text-blue-500" />
                      </div>
                      <h2 className="text-2xl font-bold">2. İçerik Kuralları</h2>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections[2] ? 'rotate-180' : ''}`} />
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0">
                  <ul className="space-y-4 ml-14">
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Yasal içerik:</strong>
                        <span className="text-muted-foreground"> Yasa dışı içerik paylaşmayın (telif ihlali, yasadışı faaliyetler vb.).</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">NSFW işaretleme:</strong>
                        <span className="text-muted-foreground"> Hassas içerik paylaşıyorsanız uygun etiketleri kullanın.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Başlıklar açık olsun:</strong>
                        <span className="text-muted-foreground"> Gönderi başlıklarınız içeriği net bir şekilde yansıtmalıdır.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Orijinal içerik:</strong>
                        <span className="text-muted-foreground"> Başkalarının içeriğini kendi içeriğiniz gibi göstermeyin.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Kaliteli tartışma:</strong>
                        <span className="text-muted-foreground"> Yapıcı ve düşünceli yorumlar paylaşın.</span>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Yasak Davranışlar */}
          <Collapsible open={openSections[3]} onOpenChange={() => toggleSection(3)}>
            <Card className="overflow-hidden border-l-4 border-l-destructive">
              <CollapsibleTrigger className="w-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-xl">
                        <ThumbsDown className="h-6 w-6 text-destructive" />
                      </div>
                      <h2 className="text-2xl font-bold">3. Yasak Davranışlar</h2>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections[3] ? 'rotate-180' : ''}`} />
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0">
                  <ul className="space-y-4 ml-14">
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Nefret söylemi:</strong>
                        <span className="text-muted-foreground"> Irk, din, cinsiyet, cinsel yönelim veya başka özelliklere dayalı ayrımcılık kesinlikle yasaktır.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Taciz:</strong>
                        <span className="text-muted-foreground"> Kullanıcıları rahatsız etmeyin, takip etmeyin veya hedef almayın.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Doxxing:</strong>
                        <span className="text-muted-foreground"> Kişisel bilgileri izinsiz paylaşmayın.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Vote manipulation:</strong>
                        <span className="text-muted-foreground"> Sahte hesaplarla oy manipülasyonu yapmayın.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Trolling:</strong>
                        <span className="text-muted-foreground"> Kasıtlı olarak tartışmayı bozmayın veya provokasyon yapmayın.</span>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Moderasyon */}
          <Collapsible open={openSections[4]} onOpenChange={() => toggleSection(4)}>
            <Card className="overflow-hidden border-l-4 border-l-amber-500">
              <CollapsibleTrigger className="w-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-xl">
                        <AlertCircle className="h-6 w-6 text-amber-500" />
                      </div>
                      <h2 className="text-2xl font-bold">4. Moderasyon ve Yaptırımlar</h2>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections[4] ? 'rotate-180' : ''}`} />
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0">
                  <ul className="space-y-4 ml-14">
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">İlk uyarı:</strong>
                        <span className="text-muted-foreground"> Küçük ihlaller için moderatörler uyarı verebilir.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Geçici ban:</strong>
                        <span className="text-muted-foreground"> Tekrarlayan ihlaller geçici hesap askıya alınması ile sonuçlanabilir (1-30 gün).</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Kalıcı ban:</strong>
                        <span className="text-muted-foreground"> Ciddi veya sürekli ihlaller kalıcı hesap kapatılmasına yol açabilir.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">İçerik silme:</strong>
                        <span className="text-muted-foreground"> Kurallara aykırı içerikler uyarı olmadan silinebilir.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Raporlama:</strong>
                        <span className="text-muted-foreground"> Kural ihlallerini "Rapor Et" butonu ile bildirebilirsiniz.</span>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* En İyi Uygulamalar */}
          <Collapsible open={openSections[5]} onOpenChange={() => toggleSection(5)}>
            <Card className="overflow-hidden border-l-4 border-l-green-500">
              <CollapsibleTrigger className="w-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                      <h2 className="text-2xl font-bold">5. En İyi Uygulamalar</h2>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${openSections[5] ? 'rotate-180' : ''}`} />
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0">
                  <ul className="space-y-4 ml-14">
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Kaynak belirtin ve çalınmış içerikten kaçının</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Arama yapın - benzer gönderiler zaten yapılmış olabilir</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Yapıcı eleştiri sunun, sadece olumsuz yorum yapmayın</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Flair'leri (etiketleri) doğru kullanın</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Kaliteli tartışmaya katkıda bulunun</span>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Yanlış bilgi yaymayın, doğruluğu kontrol edin</span>
                    </li>
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Yardım */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-3">Yardıma mı ihtiyacınız var?</h2>
                  <p className="text-muted-foreground mb-4">
                    Sorularınız veya endişeleriniz varsa, moderasyon ekibimizle iletişime geçebilirsiniz.
                    Önemli sorunlar için lütfen destek sistemimizi kullanın.
                  </p>
                  <div className="p-3 bg-background/50 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong>Not:</strong> Bu kurallar zaman içinde güncellenebilir. Lütfen düzenli olarak kontrol edin.
                    </p>
                  </div>
                </div>
              </div>
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
