import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Gamepad2, Users, TrendingUp, Trophy } from "lucide-react";

interface MiniGameStats {
  totalGames: number;
  totalPlays: number;
  activeGames: number;
  uniquePlayers: number;
  mostPlayedGame: { title: string; plays: number } | null;
  averageScore: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminMiniGamesAnalytics = () => {
  const [stats, setStats] = useState<MiniGameStats>({
    totalGames: 0,
    totalPlays: 0,
    activeGames: 0,
    uniquePlayers: 0,
    mostPlayedGame: null,
    averageScore: 0,
  });
  const [gameTypeData, setGameTypeData] = useState<any[]>([]);
  const [topGamesData, setTopGamesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get all games
      const { data: games } = await supabase
        .from("mini_games")
        .select("*");

      // Get all scores
      const { data: scores } = await supabase
        .from("mini_game_scores")
        .select("*, mini_games(title, game_type)");

      if (!games || !scores) return;

      const totalGames = games.length;
      const totalPlays = scores.length;
      const activeGames = games.filter(g => g.is_active).length;
      
      // Unique players
      const uniquePlayers = new Set(scores.map(s => s.user_identifier)).size;

      // Calculate plays per game
      const playsByGame = scores.reduce((acc: any, score: any) => {
        const gameId = score.game_id;
        acc[gameId] = (acc[gameId] || 0) + 1;
        return acc;
      }, {});

      // Find most played game
      let mostPlayedGame = null;
      let maxPlays = 0;
      for (const [gameId, plays] of Object.entries(playsByGame) as [string, number][]) {
        if (plays > maxPlays) {
          maxPlays = plays;
          const game = games.find(g => g.id === gameId);
          mostPlayedGame = game ? { title: game.title, plays } : null;
        }
      }

      // Average score
      const averageScore = totalPlays > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalPlays)
        : 0;

      // Game type distribution
      const typeDistribution = scores.reduce((acc: any, score: any) => {
        const gameType = (score.mini_games as any)?.game_type || 'unknown';
        acc[gameType] = (acc[gameType] || 0) + 1;
        return acc;
      }, {});

      const gameTypeChartData = Object.entries(typeDistribution).map(([type, count]) => ({
        name: type,
        value: count as number,
      }));

      // Top 10 games by plays
      const topGames = games
        .map(game => ({
          name: game.title.substring(0, 20),
          plays: playsByGame[game.id] || 0,
        }))
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 10);

      setStats({
        totalGames,
        totalPlays,
        activeGames,
        uniquePlayers,
        mostPlayedGame,
        averageScore,
      });
      setGameTypeData(gameTypeChartData);
      setTopGamesData(topGames);
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
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeGames} aktif oyun
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Oynanış</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlays}</div>
            <p className="text-xs text-muted-foreground">
              {stats.uniquePlayers} benzersiz oyuncu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Skor</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}</div>
            <p className="text-xs text-muted-foreground">
              Tüm oyunlar ortalaması
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Popüler</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">
              {stats.mostPlayedGame?.title || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.mostPlayedGame?.plays || 0} oynanış
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Oyun Tipi Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gameTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gameTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En Çok Oynanan Oyunlar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topGamesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="plays" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMiniGamesAnalytics;
