import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Award } from "lucide-react";

interface Subscriber {
  id: string;
  username: string;
  subscription_tier: string;
  subscription_type: string | null;
  subscribed_at: string;
  created_at: string;
  follower_since: string | null;
}

const Aboneler = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from("kick_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const tierLower = tier.toLowerCase();
    if (tierLower.includes("tier 1")) {
      return <Badge className="bg-primary text-primary-foreground">⭐ Tier 1</Badge>;
    } else if (tierLower.includes("tier 2")) {
      return <Badge className="bg-secondary text-secondary-foreground">⭐⭐ Tier 2</Badge>;
    } else if (tierLower.includes("tier 3")) {
      return <Badge className="bg-accent text-accent-foreground">⭐⭐⭐ Tier 3</Badge>;
    }
    return <Badge>{tier}</Badge>;
  };

  const getMonthsSinceSubscription = (subscribedAt: string) => {
    const subDate = new Date(subscribedAt);
    const now = new Date();
    const months = Math.floor((now.getTime() - subDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return months > 0 ? months : 1;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">
            <div className="animate-pulse text-xl font-bold">Yükleniyor...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Aboneler - HadesOST | Kick Abonelerimiz</title>
        <meta name="description" content="HadesOST'un Kick kanalına abone olan tüm destekçiler. Abonelik süreleri ve tier bilgileri." />
        <meta property="og:title" content="Aboneler - HadesOST" />
        <meta property="og:description" content="Kick kanalımıza abone olan tüm destekçilerimiz." />
        <meta name="twitter:title" content="Aboneler - HadesOST" />
        <meta name="twitter:description" content="Kick kanalımıza abone olan tüm destekçilerimiz." />
      </Helmet>
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
            <Heart className="inline-block mr-2 h-10 w-10" />
            Aboneler
          </h1>
          <p className="text-xl text-muted-foreground">
            Kick kanalımıza abone olan tüm aboneler
          </p>
          <p className="text-lg text-primary mt-2">
            Toplam: {subscribers.length} Abone 🎉
          </p>
        </div>

        {subscribers.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">
                Henüz abone bulunmuyor
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subscribers.map((subscriber) => {
              const monthsSince = getMonthsSinceSubscription(subscriber.subscribed_at);
              
              return (
                <Card key={subscriber.id} className="hover:shadow-lg transition-all hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        {subscriber.username}
                      </CardTitle>
                      {getTierBadge(subscriber.subscription_tier)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(subscriber.subscribed_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-destructive" />
                      <span className="font-semibold">
                        {monthsSince} aylık abone
                      </span>
                    </div>
                    {subscriber.follower_since && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>
                          {getMonthsSinceSubscription(subscriber.follower_since)} aylık takipçi
                        </span>
                      </div>
                    )}
                    {subscriber.subscription_type && (
                      <div className="text-xs text-muted-foreground">
                        Tip: {subscriber.subscription_type}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Aboneler;
