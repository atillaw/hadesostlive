import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

const AchievementsBadge = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId") || `guest_${Math.random()}`;

  useEffect(() => {
    if (!localStorage.getItem("userId")) {
      localStorage.setItem("userId", userId);
    }
    loadAchievements();
    checkAchievements();

    // Listen for new scores
    const channel = supabase
      .channel("achievements-check")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mini_game_scores" }, checkAchievements)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "prediction_bets" }, checkAchievements)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAchievements = async () => {
    const [achievementsData, userAchievementsData] = await Promise.all([
      supabase.from("achievements").select("*").order("points", { ascending: true }),
      supabase.from("user_achievements").select("*").eq("user_identifier", userId),
    ]);

    if (achievementsData.data) setAchievements(achievementsData.data);
    if (userAchievementsData.data) setUserAchievements(userAchievementsData.data);
    setLoading(false);
  };

  const checkAchievements = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    // Get user stats
    const [scoresData, betsData] = await Promise.all([
      supabase.from("mini_game_scores").select("*").eq("user_identifier", userId),
      supabase.from("prediction_bets").select("*").eq("user_identifier", userId),
    ]);

    const scores = scoresData.data || [];
    const bets = betsData.data || [];

    const gamesPlayed = scores.length;
    const highestScore = Math.max(...scores.map((s) => s.score), 0);
    const correctPredictions = bets.filter((b) => b.points_won && b.points_won > 0).length;

    // Check each achievement
    const achievementsToUnlock = achievements.filter((achievement) => {
      const alreadyUnlocked = userAchievements.some((ua) => ua.achievement_id === achievement.id);
      if (alreadyUnlocked) return false;

      switch (achievement.requirement_type) {
        case "games_played":
          return gamesPlayed >= achievement.requirement_value;
        case "score":
          return highestScore >= achievement.requirement_value;
        case "correct_predictions":
          return correctPredictions >= achievement.requirement_value;
        default:
          return false;
      }
    });

    // Unlock achievements
    for (const achievement of achievementsToUnlock) {
      await supabase.from("user_achievements").insert({
        user_identifier: userId,
        achievement_id: achievement.id,
      });

      toast({
        title: "🎉 Başarım Kazanıldı!",
        description: `${achievement.icon} ${achievement.title} - ${achievement.description}`,
      });
    }

    if (achievementsToUnlock.length > 0) {
      loadAchievements();
    }
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some((ua) => ua.achievement_id === achievementId);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">Yükleniyor...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Başarımlar
          <Badge variant="secondary" className="ml-auto">
            {userAchievements.length}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.map((achievement) => {
          const unlocked = isUnlocked(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                unlocked
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/30 border-muted/50 opacity-60"
              }`}
            >
              <div className="text-2xl">{unlocked ? achievement.icon : <Lock className="w-6 h-6" />}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{achievement.title}</div>
                <div className="text-xs text-muted-foreground">{achievement.description}</div>
              </div>
              <Badge variant={unlocked ? "default" : "outline"}>
                {achievement.points}p
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AchievementsBadge;
