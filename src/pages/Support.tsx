import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const SupportPage = () => {
  useEffect(() => {
    // AdSense script'ini sadece bu bileşen yüklendiğinde <head> etiketine ekle
    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3351860625616672";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    // Reklamları yüklemek için
    // Bu kodun reklam birimi yüklendiğinde çalışması önemlidir.
    try {
      // AdSense'in global `adsbygoogle` dizisini kontrol edip reklam isteğini gönderiyoruz.
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense could not be loaded:", e);
    }

    // Bileşen kaldırıldığında (başka bir sayfaya geçildiğinde) script'i temizle
    return () => {
      document.head.removeChild(script);
    };
  }, []); // Boş dependency array sayesinde bu kod sadece sayfa ilk yüklendiğinde çalışır.

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-8">
        <Card className="bg-card/50 backdrop-blur border-border card-glow">
          <CardHeader>
            <CardTitle className="text-3xl font-bold glow-text">Projeye Destek Olun</CardTitle>
            <CardDescription>
              Bu sayfa, projenin sürdürülebilirliğine katkıda bulunmak için reklam alanı olarak ayrılmıştır.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Reklam Alanı:</strong> Reklamın aşağıda görünmesi gerekmektedir.
              </AlertDescription>
            </Alert>

            <div className="mt-6 p-6 border-2 border-dashed border-border rounded-lg bg-muted/50 min-h-[300px] flex items-center justify-center">
              {/* =================================================================== */}
              {/* == REKLAM BİRİMİ KODUNUZU (INS TAGI) BURAYA YAPIŞTIRIN == */}
              {/* =================================================================== */}
              
              {/* Google AdSense'ten aldığınız <ins> ile başlayan reklam birimi kodunu 
                  aşağıdaki yorum satırının yerine yapıştırın. JSX formatında olması için 
                  style özelliğini {{ display: 'block' }} şeklinde düzenlemeyi unutmayın.
              */}

              {/* Örnek Reklam Birimi Kodu: */}
              <ins className="adsbygoogle"
                   style={{ display: 'block' }}
                   data-ad-client="ca-pub-3351860625616672"
                   data-ad-slot="REKLAM_SLOT_ID_NIZ" // BURAYI KENDİ SLOT ID'NİZLE DEĞİŞTİRİN
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>

            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SupportPage;
