import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface ViewerStat {
  recorded_at: string;
  viewer_count: number;
}

const ViewerStatsChart = () => {
  const [stats, setStats] = useState<ViewerStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('viewer-stats-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'viewer_stats'
        },
        (payload) => {
          setStats(prev => [...prev, payload.new as ViewerStat].slice(-50)); // Keep last 50 entries
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from("viewer_stats")
        .select("recorded_at, viewer_count")
        .order("recorded_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error("Error loading viewer stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const chartData = stats.map(stat => ({
    time: formatTime(stat.recorded_at),
    viewers: stat.viewer_count
  }));

  if (loading) {
    return (
      <Card className="p-8 rounded-xl border border-primary/20 card-glow bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md shadow-2xl">
        <div className="h-[320px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <div className="text-muted-foreground font-medium">Yükleniyor...</div>
          </div>
        </div>
      </Card>
    );
  }

  if (stats.length === 0) {
    return (
      <Card className="p-8 rounded-xl border border-primary/20 card-glow bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md shadow-2xl">
        <div className="h-[320px] flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/40 flex items-center justify-center backdrop-blur-sm border border-border/50">
            <TrendingUp className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Henüz izleyici verisi yok</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 rounded-xl border border-primary/20 card-glow bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md shadow-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Canlı İzleyici İstatistikleri
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Yayın boyunca izleyici sayısı değişimi
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-background/40 to-background/20 rounded-xl p-6 backdrop-blur-sm border border-border/30">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '13px', fontWeight: 500 }}
              tickMargin={10}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '13px', fontWeight: 500 }}
              tickMargin={10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--primary))/20',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 30px -10px hsl(var(--primary))/30'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="viewers" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="İzleyici"
              fill="url(#colorViewers)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 flex items-center justify-between text-sm bg-gradient-to-r from-accent/30 to-accent/10 rounded-lg p-4 border border-border/30">
        <span className="text-muted-foreground font-medium">
          📊 Son {stats.length} kayıt gösteriliyor
        </span>
        {stats.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Şu an:</span>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              {stats[stats.length - 1].viewer_count}
            </span>
            <span className="text-muted-foreground font-medium">izleyici</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ViewerStatsChart;