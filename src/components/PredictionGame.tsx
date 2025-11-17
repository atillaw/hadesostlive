import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TrendingUp, Clock, Users, Trophy } from "lucide-react";

interface PredictionOption {
  label: string;
  color: string;
}

interface Prediction {
  id: string;
  title: string;
  description: string;
  options: PredictionOption[];
  closes_at: string;
  status: string;
  correct_option_index?: number | null;
}

interface UserStats {
  total_points: number;
  correct_predictions: number;
}

const PredictionGame = () => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userBet, setUserBet] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [bets, setBets] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivePrediction();
    loadUserStats();
    const channel = supabase
      .channel("predictions-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "prediction_games" }, loadActivePrediction)
      .on("postgres_changes", { event: "*", schema: "public", table: "prediction_bets" }, () => {
        loadBets();
        loadUserStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!prediction) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(prediction.closes_at).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Kapandı");
        clearInterval(timer);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [prediction]);

  const loadActivePrediction = async () => {
    const { data } = await supabase
      .from("prediction_games")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setPrediction({
        ...data,
        options: data.options as unknown as PredictionOption[]
      });
      loadBets();
      checkUserBet(data.id);
    }
  };

  const loadBets = async () => {
    if (!prediction) return;
    
    const { data } = await supabase
      .from("prediction_bets")
      .select("option_index")
      .eq("prediction_id", prediction.id);

    if (data) {
      const counts: Record<number, number> = {};
      data.forEach((bet) => {
        counts[bet.option_index] = (counts[bet.option_index] || 0) + 1;
      });
      setBets(counts);
    }
  };

  const checkUserBet = async (predictionId: string) => {
    const userId = localStorage.getItem("userId") || `guest_${Math.random()}`;
    const { data } = await supabase
      .from("prediction_bets")
      .select("*")
      .eq("prediction_id", predictionId)
      .eq("user_identifier", userId)
      .maybeSingle();

    if (data) {
      setUserBet(data);
      setSelectedOption(data.option_index);
    }
  };

  const loadUserStats = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const { data } = await supabase
      .from("prediction_leaderboard")
      .select("*")
      .eq("user_identifier", userId)
      .maybeSingle();

    if (data) {
      setUserStats({
        total_points: data.total_points || 0,
        correct_predictions: data.correct_predictions || 0,
      });
    }
  };

  const placeBet = async () => {
    if (selectedOption === null) return;

    setLoading(true);
    const userId = localStorage.getItem("userId") || `guest_${Math.random()}`;
    localStorage.setItem("userId", userId);

    const { error } = await supabase.from("prediction_bets").insert({
      prediction_id: prediction!.id,
      user_identifier: userId,
      option_index: selectedOption,
      points_wagered: 10,
    });

    if (error) {
      toast({
        title: "Hata",
        description: "Tahmininiz kaydedilemedi.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Tahmin Kaydedildi!",
        description: "Sonuçlar açıklandığında bildirim alacaksınız.",
      });
      checkUserBet(prediction!.id);
      loadBets();
    }
    setLoading(false);
  };

  const totalBets = Object.values(bets).reduce((sum, count) => sum + count, 0);

  const getPercentage = (optionIndex: number) => {
    if (totalBets === 0) return 0;
    return Math.round(((bets[optionIndex] || 0) / totalBets) * 100);
  };

  if (!prediction) {
    return (
      <Card className="p-6 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
        <div className="text-center space-y-3">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Şu anda aktif tahmin oyunu yok</p>
        </div>
      </Card>
    );
  }

  const isClosed = new Date(prediction.closes_at) < new Date() || prediction.status !== "active";
  const hasWinner = prediction.correct_option_index !== null && prediction.correct_option_index !== undefined;
  const userWon = hasWinner && userBet && userBet.option_index === prediction.correct_option_index;

  return (
    <Card className="p-6 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20 space-y-6">
      {/* User Stats Header */}
      {userStats && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Senin Puanın</span>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="font-bold text-primary">{userStats.total_points} puan</span>
            <span className="text-muted-foreground">{userStats.correct_predictions} doğru</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold">{prediction.title}</h3>
          </div>
          {prediction.description && (
            <p className="text-sm text-muted-foreground">{prediction.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-semibold">{timeLeft}</span>
        </div>
      </div>

      <div className="space-y-3">
        {prediction.options.map((option: PredictionOption, index: number) => {
          const percentage = getPercentage(index);
          const isCorrect = hasWinner && prediction.correct_option_index === index;
          const isUserChoice = userBet && userBet.option_index === index;
          
          return (
            <div key={index} className="space-y-2">
              <button
                onClick={() => !isClosed && !userBet && setSelectedOption(index)}
                disabled={isClosed || userBet !== null}
                className={`w-full p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
                  selectedOption === index && !userBet
                    ? "border-primary bg-primary/10"
                    : isCorrect
                    ? "border-green-500 bg-green-500/10"
                    : isUserChoice && hasWinner
                    ? "border-red-500 bg-red-500/10"
                    : "border-border hover:border-primary/50"
                } ${isClosed || userBet ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <span className="font-medium flex items-center gap-2">
                    {option.label}
                    {isCorrect && <span className="text-green-500">✓</span>}
                    {isUserChoice && !isCorrect && hasWinner && <span className="text-red-500">✗</span>}
                  </span>
                  {totalBets > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                      <Badge variant="secondary" className="text-xs">{bets[index] || 0}</Badge>
                    </div>
                  )}
                </div>
                {totalBets > 0 && (
                  <Progress value={percentage} className="h-1 mt-2" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {!userBet && !isClosed && selectedOption !== null && (
        <Button onClick={placeBet} disabled={loading} className="w-full" size="lg">
          {loading ? "Kaydediliyor..." : "Tahmini Kaydet"}
        </Button>
      )}

      {userBet && (
        <Badge variant={userWon ? "default" : "secondary"} className="w-full justify-center p-3 text-base">
          {userWon ? "🎉 Kazandın! +" + (userBet.points_won || 0) + " puan" : hasWinner ? "❌ Kaybettin" : "⏳ Sonuçlar bekleniyor..."}
        </Badge>
      )}
    </Card>
  );
};

export default PredictionGame;
