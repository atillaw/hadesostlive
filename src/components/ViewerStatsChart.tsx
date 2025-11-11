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
      <Card className="p-6 border-primary/30 card-glow">
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">Yükleniyor...</div>
        </div>
      </Card>
    );
  }

  if (stats.length === 0) {
    return (
      <Card className="p-6 border-primary/30 card-glow">
        <div className="h-[300px] flex flex-col items-center justify-center gap-4">
          <TrendingUp className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">Henüz izleyici verisi yok</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-primary/30 card-glow bg-card/50 backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Canlı İzleyici İstatistikleri
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Yayın boyunca izleyici sayısı değişimi
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line 
            type="monotone" 
            dataKey="viewers" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 3 }}
            activeDot={{ r: 5 }}
            name="İzleyici"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Son {stats.length} kayıt
        </span>
        {stats.length > 0 && (
          <span className="font-medium">
            Şu an: <span className="text-primary">{stats[stats.length - 1].viewer_count}</span> izleyici
          </span>
        )}
      </div>
    </Card>
  );
};

export default ViewerStatsChart;