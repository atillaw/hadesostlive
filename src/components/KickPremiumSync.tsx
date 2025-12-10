import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw, Crown, Calendar, MessageSquare, Clock, Gift, Trophy, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface KickUserStats {
  id: string;
  kick_username: string;
  subscription_months: number;
  subscription_streak: number;
  subscription_start_date: string | null;
  follow_months: number;
  followed_at: string | null;
  total_messages: number;
  messages_this_month: number;
  most_active_hour: number | null;
  most_active_day: number | null;
  total_watch_time_minutes: number;
  loyalty_points: number;
  channel_points: number;
  total_donations: number;
  donation_count: number;
  badges: any[];
  special_badges: any[];
  monthly_activity: any[];
  last_synced_at: string | null;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
const DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

export const KickPremiumSync = () => {
  const [stats, setStats] = useState<KickUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnectionAndLoadStats();
  }, []);

  const checkConnectionAndLoadStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Check if Kick is connected
      const { data, error } = await supabase.functions.invoke("kick-get-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (data?.connected) {
        setIsConnected(true);
        await loadStats(session.access_token);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (accessToken: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: statsData } = await supabase
        .from("kick_user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (statsData) {
        setStats(statsData as KickUserStats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const syncStats = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Oturum bulunamadı");
        return;
      }

      const { data, error } = await supabase.functions.invoke("kick-sync-user-stats", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      if (data?.stats) {
        setStats(data.stats as KickUserStats);
        toast.success("İstatistikler güncellendi!");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Senkronizasyon hatası");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Crown className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Kick Hesabı Bağlı Değil</h3>
          <p className="text-muted-foreground text-center mb-4">
            Premium istatistiklerinizi görmek için Kick hesabınızı bağlayın
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const activityData = stats?.monthly_activity?.map((m: any) => ({
    name: m.month?.split("-")[1] || "",
    messages: m.messages || 0,
    watchTime: Math.round((m.watch_time_minutes || 0) / 60),
  })) || [];

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    active: stats?.most_active_hour === i ? 100 : Math.random() * 50,
  }));

  return (
    <div className="space-y-6">
      {/* Header with Sync Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Kick Premium Sync
          </h2>
          <p className="text-muted-foreground">
            {stats?.kick_username && `@${stats.kick_username}`}
            {stats?.last_synced_at && (
              <span className="ml-2 text-xs">
                Son güncelleme: {new Date(stats.last_synced_at).toLocaleString("tr-TR")}
              </span>
            )}
          </p>
        </div>
        <Button onClick={syncStats} disabled={syncing} variant="outline">
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Senkronize Et
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abonelik Süresi</p>
                <p className="text-2xl font-bold">{stats?.subscription_months || 0} Ay</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
            {stats?.subscription_streak && stats.subscription_streak > 1 && (
              <Badge variant="secondary" className="mt-2">
                🔥 {stats.subscription_streak} aylık seri
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Takip Süresi</p>
                <p className="text-2xl font-bold">{stats?.follow_months || 0} Ay</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            {stats?.followed_at && (
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(stats.followed_at).toLocaleDateString("tr-TR")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Mesaj</p>
                <p className="text-2xl font-bold">{stats?.total_messages?.toLocaleString() || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Bu ay: {stats?.messages_this_month || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">İzleme Süresi</p>
                <p className="text-2xl font-bold">
                  {Math.round((stats?.total_watch_time_minutes || 0) / 60)}s
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty & Points */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sadakat Puanı</p>
                <p className="text-xl font-bold">{stats?.loyalty_points?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-pink-500/10">
                <Gift className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Bağış</p>
                <p className="text-xl font-bold">${Number(stats?.total_donations || 0).toFixed(2)}</p>
              </div>
            </div>
            {stats?.donation_count && stats.donation_count > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {stats.donation_count} bağış yapıldı
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-cyan-500/10">
                <Trophy className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rozetler</p>
                <p className="text-xl font-bold">{(stats?.badges?.length || 0) + (stats?.special_badges?.length || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      {activityData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aylık Aktivite</CardTitle>
            <CardDescription>Son 12 aylık aktivite geçmişi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Bar dataKey="messages" name="Mesajlar" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Pattern */}
      {stats?.most_active_hour !== null && (
        <Card>
          <CardHeader>
            <CardTitle>En Aktif Zamanlar</CardTitle>
            <CardDescription>
              En aktif saat: {stats?.most_active_hour}:00 | 
              En aktif gün: {stats?.most_active_day !== null ? DAYS[stats.most_active_day] : "-"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" interval={3} className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="active" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges Display */}
      {(stats?.badges?.length || 0) + (stats?.special_badges?.length || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rozetlerim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats?.badges?.map((badge: any, index: number) => (
                <Badge key={index} variant="secondary" className="py-1.5 px-3">
                  {badge.type || badge.name || badge}
                </Badge>
              ))}
              {stats?.special_badges?.map((badge: any, index: number) => (
                <Badge key={`special-${index}`} className="py-1.5 px-3 bg-gradient-to-r from-yellow-500 to-orange-500">
                  ⭐ {badge.type || badge.name || badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Timeline */}
      {stats?.subscription_start_date && (
        <Card>
          <CardHeader>
            <CardTitle>Abonelik Zaman Çizelgesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>İlk Abone</span>
                <span>{stats.subscription_months} Ay Önce</span>
                <span>Bugün</span>
              </div>
              <Progress value={100} className="h-3" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(stats.subscription_start_date).toLocaleDateString("tr-TR")}</span>
                <span className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-yellow-500" />
                  {stats.subscription_months} aylık abone
                </span>
                <span>{new Date().toLocaleDateString("tr-TR")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KickPremiumSync;
