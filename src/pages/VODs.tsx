import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VODSection from "@/components/VODSection";
import PageContentSection from "@/components/PageContentSection";
import { Video, Clock, Star } from "lucide-react";

const VODs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <VODSection />
        <PageContentSection
          pageKey="vods"
          title="VOD Arşivi Hakkında"
          description="Tüm canlı yayınlar otomatik olarak kaydediliyor. Kaçırdığınız anları istediğiniz zaman izleyin ve değerlendirin."
          features={[
            {
              icon: <Video className="h-8 w-8 text-primary" />,
              title: "Otomatik Kayıt",
              description: "Tüm canlı yayınlar otomatik olarak arşivlenir"
            },
            {
              icon: <Clock className="h-8 w-8 text-primary" />,
              title: "7/24 Erişim",
              description: "Arşivlenmiş yayınlara istediğiniz zaman ulaşın"
            },
            {
              icon: <Star className="h-8 w-8 text-primary" />,
              title: "Puanlama Sistemi",
              description: "Beğendiğiniz yayınları puanlayın ve diğerlerinin keşfetmesine yardımcı olun"
            }
          ]}
        />
      </main>
      <Footer />
    </div>
  );
};

export default VODs;
