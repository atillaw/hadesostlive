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
  correct_option_index?: number;
}

const PredictionGame = () => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userBet, setUserBet] = useState<any>(null);
  const [bets, setBets] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivePrediction();
    const channel = supabase
      .channel("predictions-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "prediction_games" }, loadActivePrediction)
      .on("postgres_changes", { event: "*", schema: "public", table: "prediction_bets" }, loadBets)
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

  return (
    <Card className="p-6 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20 space-y-6">
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
          const isSelected = selectedOption === index;
          const isUserBet = userBet?.option_index === index;

          return (
            <div key={index} className="space-y-2">
              <button
                onClick={() => !userBet && !isClosed && setSelectedOption(index)}
                disabled={!!userBet || isClosed}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-border/50 hover:border-primary/50 hover:bg-accent/20"
                } ${userBet || isClosed ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{option.label}</span>
                  {isUserBet && <Badge variant="secondary">Tahminiz</Badge>}
                  {totalBets > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{percentage}%</span>
                    </div>
                  )}
                </div>
                {totalBets > 0 && (
                  <Progress value={percentage} className="h-2" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {totalBets > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          <Users className="w-4 h-4 inline mr-1" />
          {totalBets} kişi tahmin yaptı
        </div>
      )}

      {!userBet && !isClosed && selectedOption !== null && (
        <Button
          onClick={placeBet}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
        >
          {loading ? "Kaydediliyor..." : "Tahmini Onayla"}
        </Button>
      )}
    </Card>
  );
};

export default PredictionGame;
