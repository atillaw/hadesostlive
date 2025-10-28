import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Image, Film, TrendingUp, Mail, MessageCircle } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalIdeas: number;
  totalMemes: number;
  totalClips: number;
  totalKickSubs: number;
  totalSubscribers: number;
  totalSupportChats: number;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalIdeas: 0,
    totalMemes: 0,
    totalClips: 0,
    totalKickSubs: 0,
    totalSubscribers: 0,
    totalSupportChats: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [users, ideas, memes, clips, kickSubs, subscribers, supportChats] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("content_ideas").select("*", { count: "exact", head: true }),
        supabase.from("meme_uploads").select("*", { count: "exact", head: true }),
        supabase.from("clips").select("*", { count: "exact", head: true }),
        supabase.from("kick_subscribers").select("*", { count: "exact", head: true }),
        supabase.from("email_subscribers").select("*", { count: "exact", head: true }),
        supabase.from("support_chats").select("*", { count: "exact", head: true }),
      ]);

      setAnalytics({
        totalUsers: users.count || 0,
        totalIdeas: ideas.count || 0,
        totalMemes: memes.count || 0,
        totalClips: clips.count || 0,
        totalKickSubs: kickSubs.count || 0,
        totalSubscribers: subscribers.count || 0,
        totalSupportChats: supportChats.count || 0,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: "Toplam Kullanıcı", value: analytics.totalUsers, icon: Users, color: "text-blue-500" },
    { title: "İçerik Fikirleri", value: analytics.totalIdeas, icon: Heart, color: "text-pink-500" },
    { title: "Memeler", value: analytics.totalMemes, icon: Image, color: "text-purple-500" },
    { title: "Klipler", value: analytics.totalClips, icon: Film, color: "text-green-500" },
    { title: "Kick Aboneleri", value: analytics.totalKickSubs, icon: TrendingUp, color: "text-orange-500" },
    { title: "Email Aboneleri", value: analytics.totalSubscribers, icon: Mail, color: "text-cyan-500" },
    { title: "Destek Sohbetleri", value: analytics.totalSupportChats, icon: MessageCircle, color: "text-yellow-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-pulse text-xl font-bold">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Site Analytics</h2>
        <p className="text-muted-foreground">Sitenizin genel istatistiklerini görüntüleyin</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminAnalytics;
