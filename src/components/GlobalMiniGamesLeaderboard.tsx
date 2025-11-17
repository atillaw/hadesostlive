import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  user_identifier: string;
  game_type: string;
  game_title: string;
  score: number;
  completed_at: string;
}

const GlobalMiniGamesLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    
    const channel = supabase
      .channel('global-leaderboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mini_game_scores' }, loadLeaderboard)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('mini_game_scores')
        .select(`
          user_identifier,
          score,
          completed_at,
          mini_games (
            game_type,
            title
          )
        `)
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formatted = data?.map(entry => ({
        user_identifier: entry.user_identifier,
        game_type: (entry.mini_games as any)?.game_type || 'unknown',
        game_title: (entry.mini_games as any)?.title || 'Unknown Game',
        score: entry.score,
        completed_at: entry.completed_at
      })) || [];

      setLeaderboard(formatted);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case "reaction": return "⚡";
      case "memory": return "🧠";
      case "trivia": return "📚";
      case "typing": return "⌨️";
      default: return "🎮";
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-orange-600" />;
    return <span className="text-muted-foreground">#{index + 1}</span>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Global Mini Games Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Henüz oyun skoru yok
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={`${entry.user_identifier}-${entry.completed_at}`}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  index < 3 ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(index)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getGameIcon(entry.game_type)}</span>
                    <span className="font-medium">{entry.game_title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {entry.user_identifier.startsWith('guest_') 
                      ? `Misafir ${entry.user_identifier.slice(-8)}`
                      : entry.user_identifier}
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {entry.score.toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalMiniGamesLeaderboard;
