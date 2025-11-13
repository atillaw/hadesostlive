import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calendar, Clock, Users, Award } from "lucide-react";

interface StatsPeriod {
  period: string;
  avg_viewers: number;
  peak_viewers: number;
  min_viewers: number;
  data_points: number;
}

const ViewerStatsDetailed = () => {
  const [hourlyStats, setHourlyStats] = useState<StatsPeriod[]>([]);
  const [dailyStats, setDailyStats] = useState<StatsPeriod[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<StatsPeriod[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<StatsPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    setLoading(true);
    await Promise.all([
      loadHourlyStats(),
      loadDailyStats(),
      loadWeeklyStats(),
      loadMonthlyStats(),
    ]);
    setLoading(false);
  };

  const loadHourlyStats = async () => {
    const { data } = await supabase
      .from("viewer_stats_hourly")
      .select("*")
      .limit(24)
      .order("hour", { ascending: false });
    
    if (data) {
      setHourlyStats(data.reverse().map((stat: any) => ({
        period: new Date(stat.hour).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        avg_viewers: Math.round(stat.avg_viewers),
        peak_viewers: stat.peak_viewers,
        min_viewers: stat.min_viewers,
        data_points: stat.data_points,
      })));
    }
  };

  const loadDailyStats = async () => {
    const { data } = await supabase
      .from("viewer_stats_daily")
      .select("*")
      .limit(30)
      .order("day", { ascending: false });
    
    if (data) {
      setDailyStats(data.reverse().map((stat: any) => ({
        period: new Date(stat.day).toLocaleDateString("tr-TR", { month: "short", day: "numeric" }),
        avg_viewers: Math.round(stat.avg_viewers),
        peak_viewers: stat.peak_viewers,
        min_viewers: stat.min_viewers,
        data_points: stat.data_points,
      })));
    }
  };

  const loadWeeklyStats = async () => {
    const { data } = await supabase
      .from("viewer_stats_weekly")
      .select("*")
      .limit(12)
      .order("week", { ascending: false });
    
    if (data) {
      setWeeklyStats(data.reverse().map((stat: any) => ({
        period: `Hafta ${new Date(stat.week).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}`,
        avg_viewers: Math.round(stat.avg_viewers),
        peak_viewers: stat.peak_viewers,
        min_viewers: stat.min_viewers,
        data_points: stat.data_points,
      })));
    }
  };

  const loadMonthlyStats = async () => {
    const { data } = await supabase
      .from("viewer_stats_monthly")
      .select("*")
      .limit(12)
      .order("month", { ascending: false });
    
    if (data) {
      setMonthlyStats(data.reverse().map((stat: any) => ({
        period: new Date(stat.month).toLocaleDateString("tr-TR", { year: "numeric", month: "long" }),
        avg_viewers: Math.round(stat.avg_viewers),
        peak_viewers: stat.peak_viewers,
        min_viewers: stat.min_viewers,
        data_points: stat.data_points,
      })));
    }
  };

  const renderChart = (data: StatsPeriod[], title: string, icon: React.ReactNode) => {
    if (data.length === 0) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center gap-4">
          {icon}
          <p className="text-muted-foreground">Henüz veri yok</p>
        </div>
      );
    }

    const maxPeak = Math.max(...data.map(d => d.peak_viewers));
    const avgViewers = Math.round(data.reduce((sum, d) => sum + d.avg_viewers, 0) / data.length);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ortalama İzleyici</p>
                <p className="text-2xl font-bold">{avgViewers}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Yüksek</p>
                <p className="text-2xl font-bold">{maxPeak}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Kayıt</p>
                <p className="text-2xl font-bold">{data.reduce((sum, d) => sum + d.data_points, 0)}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-gradient-to-br from-background/40 to-background/20 rounded-xl p-6 backdrop-blur-sm border border-border/30">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="period" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avg_viewers" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                name="Ortalama"
                fill="url(#colorAvg)"
              />
              <Line 
                type="monotone" 
                dataKey="peak_viewers" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                strokeDasharray="5 5"
                name="Peak"
                fill="url(#colorPeak)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="p-8 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-muted-foreground">İstatistikler yükleniyor...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
      <div className="mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Detaylı İzleyici Analizi
        </h3>
        <p className="text-muted-foreground">Farklı zaman dilimlerinde izleyici istatistikleri</p>
      </div>

      <Tabs defaultValue="hourly" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="hourly">
            <Clock className="w-4 h-4 mr-2" />
            Saatlik
          </TabsTrigger>
          <TabsTrigger value="daily">
            <Calendar className="w-4 h-4 mr-2" />
            Günlük
          </TabsTrigger>
          <TabsTrigger value="weekly">
            <TrendingUp className="w-4 h-4 mr-2" />
            Haftalık
          </TabsTrigger>
          <TabsTrigger value="monthly">
            <Award className="w-4 h-4 mr-2" />
            Aylık
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hourly">
          {renderChart(hourlyStats, "Saatlik İstatistikler", <Clock className="w-12 h-12 text-muted-foreground" />)}
        </TabsContent>

        <TabsContent value="daily">
          {renderChart(dailyStats, "Günlük İstatistikler", <Calendar className="w-12 h-12 text-muted-foreground" />)}
        </TabsContent>

        <TabsContent value="weekly">
          {renderChart(weeklyStats, "Haftalık İstatistikler", <TrendingUp className="w-12 h-12 text-muted-foreground" />)}
        </TabsContent>

        <TabsContent value="monthly">
          {renderChart(monthlyStats, "Aylık İstatistikler", <Award className="w-12 h-12 text-muted-foreground" />)}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ViewerStatsDetailed;
