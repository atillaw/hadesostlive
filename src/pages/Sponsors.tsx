import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  description: string | null;
  logo_url: string;
  display_order: number;
}

const Sponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error("Sponsor yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold glow-text mb-4">Sponsorlarımız</h1>
            <p className="text-muted-foreground text-lg">
              Bizi destekleyen değerli sponsorlarımız
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sponsors.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Henüz sponsor bulunmamaktadır.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsors.map((sponsor) => (
                <Card
                  key={sponsor.id}
                  className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover:scale-105 card-glow overflow-hidden"
                >
                  <div className="w-full aspect-video bg-background/50 flex items-center justify-center p-6">
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold">{sponsor.name}</h3>
                      {sponsor.description && (
                        <p className="text-muted-foreground text-sm">
                          {sponsor.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sponsors;
