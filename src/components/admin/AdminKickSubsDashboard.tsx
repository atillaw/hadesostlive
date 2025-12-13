import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Crown, Users, MessageSquare, TrendingUp, Trophy, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

interface Summary {
  totalSubscribers: number;
  totalFollowers: number;
  avgSubMonths: number;
  totalMessages: number;
  totalDonations: number;
  totalLoyaltyPoints: number;
  totalUsers: number;
}

interface TierData {
  months: number;
  count: number;
}

interface Subscriber {
  id: string;
  kick_username: string;
  subscription_months: number;
  subscription_streak: number;
  total_messages: number;
  loyalty_points: number;
  badges: any[];
  last_synced_at: string;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

const AdminKickSubsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tierData, setTierData] = useState<TierData[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topChatters, setTopChatters] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Oturum bulunamadı");
        return;
      }

      // Load summary
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke(
        "kick-admin-stats",
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: { action: "summary" },
        }
      );

      if (summaryError) throw summaryError;
      
      if (summaryData) {
        setSummary(summaryData.summary);
        setTierData(summaryData.tierData || []);
        setRecentActivity(summaryData.recentActivity || []);
      }

      // Load subscribers
      const { data: subsData } = await supabase.functions.invoke(
        "kick-admin-stats",
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: { action: "subscribers" },
        }
      );
      if (subsData?.subscribers) {
        setSubscribers(subsData.subscribers);
      }

      // Load top chatters
      const { data: chattersData } = await supabase.functions.invoke(
        "kick-admin-stats",
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: { action: "top-chatters" },
        }
      );
      if (chattersData?.topChatters) {
        setTopChatters(chattersData.topChatters);
      }

      // Load leaderboard
      const { data: leaderboardData } = await supabase.functions.invoke(
        "kick-admin-stats",
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: { action: "loyalty-leaderboard" },
        }
      );
      if (leaderboardData?.leaderboard) {
        setLeaderboard(leaderboardData.leaderboard);
      }

    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Dashboard yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Kullanıcı Adı", "Abonelik Ayı", "Seri", "Mesaj Sayısı", "Sadakat Puanı"];
    const csvContent = [
      headers.join(","),
      ...subscribers.map(s => [
        s.kick_username,
        s.subscription_months,
        s.subscription_streak,
        s.total_messages,
        s.loyalty_points
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kick-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const filteredSubscribers = subscribers.filter(s =>
    s.kick_username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = tierData.slice(0, 7).map((t, i) => ({
    name: `${t.months} Ay`,
    value: t.count,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Kick Subs Dashboard
          </h2>
          <p className="text-muted-foreground">hadesost kanalı abone istatistikleri</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            CSV İndir
          </Button>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Toplam Abone</p>
              <p className="text-2xl font-bold text-yellow-500">{summary?.totalSubscribers || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Toplam Takipçi</p>
              <p className="text-2xl font-bold text-blue-500">{summary?.totalFollowers || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Ort. Abone Ayı</p>
              <p className="text-2xl font-bold text-green-500">{summary?.avgSubMonths || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Toplam Mesaj</p>
              <p className="text-2xl font-bold text-purple-500">{summary?.totalMessages?.toLocaleString() || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Toplam Bağış</p>
              <p className="text-2xl font-bold text-pink-500">${summary?.totalDonations || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Sadakat Puanı</p>
              <p className="text-2xl font-bold text-orange-500">{summary?.totalLoyaltyPoints?.toLocaleString() || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Kayıtlı Kullanıcı</p>
              <p className="text-2xl font-bold text-cyan-500">{summary?.totalUsers || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Subscription Tiers Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Abonelik Süreleri Dağılımı</CardTitle>
            <CardDescription>Kaç aylık abonelerin sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="months" tickFormatter={(v) => `${v} ay`} className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: any) => [`${value} abone`, "Sayı"]}
                    labelFormatter={(label) => `${label} aylık aboneler`}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Abonelik Dağılımı</CardTitle>
            <CardDescription>Sürelere göre pasta grafiği</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="subscribers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subscribers">Aboneler</TabsTrigger>
          <TabsTrigger value="chatters">Top Chatters</TabsTrigger>
          <TabsTrigger value="leaderboard">Liderlik</TabsTrigger>
          <TabsTrigger value="recent">Son Aktivite</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tüm Aboneler</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Kullanıcı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sıra</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Abonelik</TableHead>
                    <TableHead>Seri</TableHead>
                    <TableHead>Mesajlar</TableHead>
                    <TableHead>Sadakat</TableHead>
                    <TableHead>Son Sync</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((sub, index) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        {index < 3 ? (
                          <span className={`text-lg ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-orange-500"}`}>
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{sub.kick_username}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                          <Crown className="h-3 w-3 mr-1" />
                          {sub.subscription_months} ay
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sub.subscription_streak > 1 && (
                          <Badge variant="outline">🔥 {sub.subscription_streak}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{sub.total_messages?.toLocaleString() || 0}</TableCell>
                      <TableCell>{sub.loyalty_points?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {sub.last_synced_at ? new Date(sub.last_synced_at).toLocaleDateString("tr-TR") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatters" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                En Aktif Sohbetçiler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sıra</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Toplam Mesaj</TableHead>
                    <TableHead>Bu Ay</TableHead>
                    <TableHead>En Aktif Saat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topChatters.map((chatter, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{chatter.kick_username}</TableCell>
                      <TableCell>{chatter.total_messages?.toLocaleString() || 0}</TableCell>
                      <TableCell>{chatter.messages_this_month?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        {chatter.most_active_hour !== null ? `${chatter.most_active_hour}:00` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Sadakat Liderlik Tablosu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sıra</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Sadakat Puanı</TableHead>
                    <TableHead>Abonelik</TableHead>
                    <TableHead>Mesajlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {index < 3 ? (
                          <span className="text-lg">
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                          </span>
                        ) : (
                          index + 1
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{user.kick_username}</TableCell>
                      <TableCell className="font-bold text-orange-500">
                        {user.loyalty_points?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell>{user.subscription_months || 0} ay</TableCell>
                      <TableCell>{user.total_messages?.toLocaleString() || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Son Aktiviteler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Abonelik</TableHead>
                    <TableHead>Mesajlar</TableHead>
                    <TableHead>Son Görülme</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{activity.kick_username}</TableCell>
                      <TableCell>
                        {activity.subscription_months > 0 && (
                          <Badge variant="secondary">{activity.subscription_months} ay</Badge>
                        )}
                      </TableCell>
                      <TableCell>{activity.total_messages?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {activity.last_seen_at ? new Date(activity.last_seen_at).toLocaleString("tr-TR") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminKickSubsDashboard;
