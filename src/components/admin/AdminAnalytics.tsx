import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Heart, Image, Film, TrendingUp, Mail, MessageCircle, Eye, Activity } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalProposals: number;
  totalMemes: number;
  totalClips: number;
  totalKickSubs: number;
  totalSubscribers: number;
  totalSupportChats: number;
  totalPageViews: number;
  todayPageViews: number;
  uniqueVisitors: number;
  totalImpactPoints: number;
  totalTransactions: number;
  activeMiniGames: number;
  activePredictions: number;
  recentVODViews: number;
}

interface PageViewStats {
  page_path: string;
  view_count: number;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalProposals: 0,
    totalMemes: 0,
    totalClips: 0,
    totalKickSubs: 0,
    totalSubscribers: 0,
    totalSupportChats: 0,
    totalPageViews: 0,
    todayPageViews: 0,
    uniqueVisitors: 0,
    totalImpactPoints: 0,
    totalTransactions: 0,
    activeMiniGames: 0,
    activePredictions: 0,
    recentVODViews: 0,
  });
  const [pageStats, setPageStats] = useState<PageViewStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeViews, setRealtimeViews] = useState(0);

  useEffect(() => {
    fetchAnalytics();
    
    // Set up realtime subscription for page views
    const channel = supabase
      .channel('page-views-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'page_views'
        },
        () => {
          setRealtimeViews(prev => prev + 1);
          // Refresh analytics data
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [users, proposals, memes, clips, kickSubs, subscribers, supportChats, pageViews, todayViews, uniqueVisitors, topPages, impactPoints, paytrTransactions, miniGames, predictions, vodViews] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("community_proposals").select("*", { count: "exact", head: true }),
        supabase.from("meme_uploads").select("*", { count: "exact", head: true }),
        supabase.from("clips").select("*", { count: "exact", head: true }),
        supabase.from("kick_subscribers").select("*", { count: "exact", head: true }),
        supabase.from("email_subscribers").select("*", { count: "exact", head: true }),
        supabase.from("support_chats").select("*", { count: "exact", head: true }),
        supabase.from("page_views").select("*", { count: "exact", head: true }),
        supabase.from("page_views")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase.from("page_views")
          .select("user_identifier", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("page_views")
          .select("page_path")
          .gte("created_at", today.toISOString()),
        supabase.from("impact_points").select("*", { count: "exact", head: true }),
        supabase.from("paytr_transactions").select("*", { count: "exact", head: true }),
        supabase.from("mini_games").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("prediction_games").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("vod_views").select("*", { count: "exact", head: true }).gte("watched_at", new Date(Date.now() - 3600000).toISOString()),
      ]);

      // Calculate unique visitors
      const uniqueVisitorsSet = new Set(
        (topPages.data || []).map((view: any) => view.user_identifier)
      );

      // Calculate page view stats
      const pageViewCounts: { [key: string]: number } = {};
      (topPages.data || []).forEach((view: any) => {
        pageViewCounts[view.page_path] = (pageViewCounts[view.page_path] || 0) + 1;
      });

      const sortedPages = Object.entries(pageViewCounts)
        .map(([page_path, view_count]) => ({ page_path, view_count }))
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5);

      setPageStats(sortedPages);

      setAnalytics({
        totalUsers: users.count || 0,
        totalProposals: proposals.count || 0,
        totalMemes: memes.count || 0,
        totalClips: clips.count || 0,
        totalKickSubs: kickSubs.count || 0,
        totalSubscribers: subscribers.count || 0,
        totalSupportChats: supportChats.count || 0,
        totalPageViews: pageViews.count || 0,
        todayPageViews: todayViews.count || 0,
        uniqueVisitors: uniqueVisitorsSet.size,
        totalImpactPoints: impactPoints.count || 0,
        totalTransactions: paytrTransactions.count || 0,
        activeMiniGames: miniGames.count || 0,
        activePredictions: predictions.count || 0,
        recentVODViews: vodViews.count || 0,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: "Toplam Kullanıcı", value: analytics.totalUsers, icon: Users, color: "text-blue-500" },
    { title: "Topluluk Önerileri", value: analytics.totalProposals, icon: Heart, color: "text-pink-500" },
    { title: "Memeler", value: analytics.totalMemes, icon: Image, color: "text-purple-500" },
    { title: "Klipler", value: analytics.totalClips, icon: Film, color: "text-green-500" },
    { title: "Kick Aboneleri", value: analytics.totalKickSubs, icon: TrendingUp, color: "text-orange-500" },
    { title: "Email Aboneleri", value: analytics.totalSubscribers, icon: Mail, color: "text-cyan-500" },
    { title: "Destek Sohbetleri", value: analytics.totalSupportChats, icon: MessageCircle, color: "text-yellow-500" },
    { title: "Impact Points Kullanıcıları", value: analytics.totalImpactPoints, icon: Activity, color: "text-red-500" },
    { title: "PayTR İşlemleri", value: analytics.totalTransactions, icon: Activity, color: "text-emerald-500" },
  ];

  const trafficStats = [
    { title: "Toplam Görüntüleme", value: analytics.totalPageViews, icon: Eye, color: "text-indigo-500", description: "Tüm zamanlar" },
    { title: "Bugünkü Görüntülemeler", value: analytics.todayPageViews, icon: Activity, color: "text-emerald-500", description: "Son 24 saat" },
    { title: "Tekil Ziyaretçi", value: analytics.uniqueVisitors, icon: Users, color: "text-violet-500", description: "Bugün" },
  ];

  const liveStats = [
    { title: "Aktif Mini Oyunlar", value: analytics.activeMiniGames, icon: Activity, color: "text-blue-500", description: "Şu anda aktif" },
    { title: "Aktif Tahmin Oyunları", value: analytics.activePredictions, icon: TrendingUp, color: "text-purple-500", description: "Devam ediyor" },
    { title: "Son Saat VOD İzlemeleri", value: analytics.recentVODViews, icon: Film, color: "text-pink-500", description: "Son 1 saat" },
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
        <p className="text-muted-foreground">Sitenizin genel istatistiklerini ve canlı trafiğini görüntüleyin</p>
        {realtimeViews > 0 && (
          <p className="text-sm text-green-500 mt-2 animate-pulse">
            🟢 {realtimeViews} yeni ziyaret (canlı)
          </p>
        )}
      </div>

      {/* Live Activity Stats */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Canlı Aktivite
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {liveStats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{stat.description}</CardDescription>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Traffic Stats */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Site Trafiği</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {trafficStats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{stat.description}</CardDescription>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Pages */}
      {pageStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>En Çok Ziyaret Edilen Sayfalar (Bugün)</CardTitle>
            <CardDescription>Son 24 saatteki popüler sayfalar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pageStats.map((page, index) => (
                <div key={page.page_path} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{page.page_path || '/'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-semibold">{page.view_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Stats */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Genel İstatistikler</h3>
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
    </div>
  );
};

export default AdminAnalytics;
