import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const SupportPage = () => {
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
                <strong>Reklam Alanı:</strong> Google AdSense reklam kodunuzu aşağıda belirtilen alana yerleştirebilirsiniz.
              </AlertDescription>
            </Alert>

            <div className="mt-6 p-6 border-2 border-dashed border-border rounded-lg bg-muted/50 min-h-[300px] flex items-center justify-center">
              {/* =================================================================== */}
              {/* == GOOGLE ADSENSE VEYA DİĞER REKLAM KODUNUZU BURAYA YAPIŞTIRIN == */}
              {/* =================================================================== */}
              
              {/* Örnek AdSense Kodu:
              <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
                   crossorigin="anonymous"></script>
              <ins class="adsbygoogle"
                   style="display:block"
                   data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                   data-ad-slot="XXXXXXXXXX"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              <script>
                   (adsbygoogle = window.adsbygoogle || []).push({});
              </script>
              */}
              
              <span className="text-muted-foreground">Reklam Alanı</span>

            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SupportPage;
