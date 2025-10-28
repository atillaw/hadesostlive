import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale/tr";

interface Supporter {
  id: string;
  username: string;
  subscription_tier: string;
  subscription_type: string | null;
  subscribed_at: string;
  created_at: string;
}

const Supporters = () => {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupporters();
  }, []);

  const fetchSupporters = async () => {
    try {
      const { data, error } = await supabase
        .from("kick_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      setSupporters(data || []);
    } catch (error) {
      console.error("Error fetching supporters:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "tier 1":
        return <Badge className="bg-blue-500">⭐ Tier 1</Badge>;
      case "tier 2":
        return <Badge className="bg-purple-500">⭐⭐ Tier 2</Badge>;
      case "tier 3":
        return <Badge className="bg-amber-500">⭐⭐⭐ Tier 3</Badge>;
      default:
        return <Badge>{tier}</Badge>;
    }
  };

  const getMonthsSinceSubscription = (subscribedAt: string) => {
    const subDate = new Date(subscribedAt);
    const now = new Date();
    const months = Math.floor((now.getTime() - subDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return months > 0 ? months : 1;
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
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
            <Heart className="inline-block mr-2 h-10 w-10" />
            Destekçilerimiz
          </h1>
          <p className="text-xl text-muted-foreground">
            Kick kanalımıza abone olan tüm destekçilerimiz
          </p>
          <p className="text-lg text-primary mt-2">
            Toplam: {supporters.length} Destekçi 🎉
          </p>
        </div>

        {supporters.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">
                Henüz destekçi bulunmuyor
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {supporters.map((supporter) => {
              const monthsSince = getMonthsSinceSubscription(supporter.subscribed_at);
              
              return (
                <Card key={supporter.id} className="hover:shadow-lg transition-all hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        {supporter.username}
                      </CardTitle>
                      {getTierBadge(supporter.subscription_tier)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDistanceToNow(new Date(supporter.subscribed_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="font-semibold">
                        {monthsSince} ay{monthsSince > 1 ? "" : ""} destekçi
                      </span>
                    </div>
                    {supporter.subscription_type && (
                      <div className="text-xs text-muted-foreground">
                        Tip: {supporter.subscription_type}
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

export default Supporters;
