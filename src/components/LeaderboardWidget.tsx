import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  user_identifier: string;
  total_points: number;
  correct_predictions: number;
  games_played: number;
}

const LeaderboardWidget = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    
    const channel = supabase
      .channel("leaderboard-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "prediction_bets" }, loadLeaderboard)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("prediction_leaderboard")
        .select("*")
        .limit(10);

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank + 1}</span>;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
        <div className="text-center">Yükleniyor...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-xl font-bold">Liderlik Tablosu</h3>
        </div>
        <Badge variant="secondary">Tahmin Oyunları</Badge>
      </div>

      {leaders.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Henüz lider yok. İlk sen ol!
        </div>
      ) : (
        <div className="space-y-2">
          {leaders.map((leader, index) => (
            <div
              key={leader.user_identifier}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                index < 3
                  ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
                  : "bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 flex justify-center">
                  {getMedalIcon(index)}
                </div>
                <div>
                  <div className="font-medium truncate max-w-[150px]">
                    {leader.user_identifier.substring(0, 12)}...
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {leader.correct_predictions} doğru / {leader.games_played} oyun
                  </div>
                </div>
              </div>
              <Badge variant={index < 3 ? "default" : "secondary"} className="font-bold">
                {leader.total_points} puan
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default LeaderboardWidget;
