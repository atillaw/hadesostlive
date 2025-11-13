import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Gamepad2, Trophy, Clock, Zap } from "lucide-react";

interface MiniGame {
  id: string;
  game_type: string;
  title: string;
  config: any;
  ends_at: string;
}

const MiniGameWidget = () => {
  const [game, setGame] = useState<MiniGame | null>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    loadActiveGame();
    const channel = supabase
      .channel("mini-games-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "mini_games" }, loadActiveGame)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadActiveGame = async () => {
    const { data } = await supabase
      .from("mini_games")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setGame(data);
    }
  };

  const startGame = () => {
    setPlaying(true);
    setScore(0);
    setReactionTime(null);
    
    if (game?.game_type === "reaction") {
      startReactionGame();
    }
  };

  const startReactionGame = () => {
    setWaiting(true);
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    
    setTimeout(() => {
      setWaiting(false);
      setStartTime(Date.now());
    }, delay);
  };

  const handleReactionClick = async () => {
    if (waiting) {
      toast({
        title: "Çok Erken!",
        description: "Yeşil ışık yanana kadar bekle",
        variant: "destructive",
      });
      setPlaying(false);
      setWaiting(false);
      return;
    }

    if (startTime === 0) return;

    const time = Date.now() - startTime;
    setReactionTime(time);
    setScore(Math.max(1000 - time, 0));
    setPlaying(false);

    // Save score
    const userId = localStorage.getItem("userId") || `guest_${Math.random()}`;
    localStorage.setItem("userId", userId);

    await supabase.from("mini_game_scores").insert({
      game_id: game!.id,
      user_identifier: userId,
      score: Math.max(1000 - time, 0),
    });

    toast({
      title: "Harika!",
      description: `Tepki süreniz: ${time}ms`,
    });
  };

  if (!game) {
    return (
      <Card className="p-6 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
        <div className="text-center space-y-3">
          <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Şu anda aktif mini oyun yok</p>
        </div>
      </Card>
    );
  }

  if (game.game_type === "reaction") {
    return (
      <Card className="p-6 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold">{game.title}</h3>
          </div>
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Tepki Testi
          </Badge>
        </div>

        {!playing && reactionTime === null && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Yeşil ışık yandığında mümkün olan en hızlı şekilde tıkla!
            </p>
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
              size="lg"
            >
              Başla
            </Button>
          </div>
        )}

        {playing && (
          <div
            onClick={handleReactionClick}
            className={`h-48 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
              waiting
                ? "bg-red-500/20 border-2 border-red-500"
                : "bg-green-500/20 border-2 border-green-500 animate-pulse"
            }`}
          >
            <span className="text-2xl font-bold">
              {waiting ? "Bekle..." : "ŞİMDİ!"}
            </span>
          </div>
        )}

        {reactionTime !== null && (
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <Trophy className="w-16 h-16 mx-auto text-primary animate-bounce" />
              <div className="text-3xl font-bold text-primary">{reactionTime}ms</div>
              <p className="text-muted-foreground">Puan: {score}</p>
            </div>
            <Button
              onClick={startGame}
              variant="outline"
              className="w-full"
            >
              Tekrar Dene
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return null;
};

export default MiniGameWidget;
