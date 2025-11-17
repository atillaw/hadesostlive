import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Target, Trophy } from "lucide-react";

interface PredictionStats {
  totalGames: number;
  totalBets: number;
  activeGames: number;
  completedGames: number;
  averageParticipants: number;
  winRate: number;
  mostPopularGame: { title: string; bets: number } | null;
}

const AdminPredictionAnalytics = () => {
  const [stats, setStats] = useState<PredictionStats>({
    totalGames: 0,
    totalBets: 0,
    activeGames: 0,
    completedGames: 0,
    averageParticipants: 0,
    winRate: 0,
    mostPopularGame: null,
  });
  const [gameData, setGameData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get all games
      const { data: games } = await supabase
        .from("prediction_games")
        .select("*");

      // Get all bets
      const { data: bets } = await supabase
        .from("prediction_bets")
        .select("*, prediction_games(title)");

      if (!games || !bets) return;

      const totalGames = games.length;
      const totalBets = bets.length;
      const activeGames = games.filter(g => g.status === 'active').length;
      const completedGames = games.filter(g => g.status === 'closed').length;

      // Calculate average participants per game
      const betsByGame = bets.reduce((acc: any, bet: any) => {
        acc[bet.prediction_id] = (acc[bet.prediction_id] || 0) + 1;
        return acc;
      }, {});

      const averageParticipants = totalGames > 0 
        ? Math.round(totalBets / totalGames) 
        : 0;

      // Find most popular game
      let mostPopularGame = null;
      let maxBets = 0;
      for (const [gameId, count] of Object.entries(betsByGame) as [string, number][]) {
        if (count > maxBets) {
          maxBets = count;
          const game = games.find(g => g.id === gameId);
          mostPopularGame = game ? { title: game.title, bets: count } : null;
        }
      }

      // Calculate win rate
      const correctBets = bets.filter(b => b.points_won && b.points_won > 0).length;
      const winRate = totalBets > 0 ? Math.round((correctBets / totalBets) * 100) : 0;

      // Prepare chart data
      const chartData = games.slice(0, 10).map(game => ({
        name: game.title.substring(0, 20),
        participants: betsByGame[game.id] || 0,
      }));

      setStats({
        totalGames,
        totalBets,
        activeGames,
        completedGames,
        averageParticipants,
        winRate,
        mostPopularGame,
      });
      setGameData(chartData);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Oyun</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeGames} aktif, {stats.completedGames} tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bahis</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBets}</div>
            <p className="text-xs text-muted-foreground">
              Oyun başına ort. {stats.averageParticipants} katılımcı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kazanma Oranı</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{stats.winRate}</div>
            <p className="text-xs text-muted-foreground">
              Doğru tahmin oranı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Popüler</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">
              {stats.mostPopularGame?.title || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.mostPopularGame?.bets || 0} bahis
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oyun Katılım İstatistikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gameData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="participants" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPredictionAnalytics;
