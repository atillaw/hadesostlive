import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, Award, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface PredictionBet {
  id: string;
  prediction_id: string;
  option_index: number;
  points_wagered: number;
  points_won: number | null;
  created_at: string;
  prediction_games: {
    title: string;
    options: any;
    correct_option_index: number | null;
    status: string;
  };
}

interface UserStats {
  totalBets: number;
  correctPredictions: number;
  totalPointsWon: number;
  totalPointsWagered: number;
  winRate: number;
}

const PredictionProfile = () => {
  const [bets, setBets] = useState<PredictionBet[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalBets: 0,
    correctPredictions: 0,
    totalPointsWon: 0,
    totalPointsWagered: 0,
    winRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    loadPredictionHistory();
  }, []);

  const loadPredictionHistory = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("prediction_bets")
      .select("*, prediction_games(title, options, correct_option_index, status)")
      .eq("user_identifier", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setBets(data);
      
      const totalBets = data.length;
      const correctPredictions = data.filter((bet) => 
        bet.prediction_games.correct_option_index === bet.option_index
      ).length;
      const totalPointsWon = data.reduce((sum, bet) => sum + (bet.points_won || 0), 0);
      const totalPointsWagered = data.reduce((sum, bet) => sum + bet.points_wagered, 0);
      const winRate = totalBets > 0 ? (correctPredictions / totalBets) * 100 : 0;

      setStats({
        totalBets,
        correctPredictions,
        totalPointsWon,
        totalPointsWagered,
        winRate,
      });
    }

    setLoading(false);
  };

  const getResultBadge = (bet: PredictionBet) => {
    if (bet.prediction_games.status !== "resolved") {
      return <Badge variant="outline">Beklemede</Badge>;
    }
    
    const isCorrect = bet.prediction_games.correct_option_index === bet.option_index;
    return isCorrect ? (
      <Badge className="bg-green-500 hover:bg-green-600">+{bet.points_won} puan</Badge>
    ) : (
      <Badge variant="destructive">-{bet.points_wagered} puan</Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background/95">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold glow-text">Tahmin Geçmişim</h1>
            <p className="text-muted-foreground">
              Tüm tahminlerinizi ve istatistiklerinizi görüntüleyin
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-xl">Yükleniyor...</div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Tahmin</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalBets}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Doğru Tahmin</CardTitle>
                    <Award className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">{stats.correctPredictions}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Kazanma Oranı</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Kazanç</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${
                      stats.totalPointsWon - stats.totalPointsWagered >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {stats.totalPointsWon - stats.totalPointsWagered > 0 ? "+" : ""}
                      {stats.totalPointsWon - stats.totalPointsWagered}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Prediction History */}
              <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20">
                <CardHeader>
                  <CardTitle>Tahmin Geçmişi</CardTitle>
                </CardHeader>
                <CardContent>
                  {bets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Henüz bir tahmin yapmadınız
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bets.map((bet) => (
                        <div
                          key={bet.id}
                          className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="font-semibold">{bet.prediction_games.title}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(bet.created_at).toLocaleDateString("tr-TR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Tahmin: </span>
                              {bet.prediction_games.options[bet.option_index]}
                            </div>
                            {bet.prediction_games.status === "resolved" && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Doğru Cevap: </span>
                                {bet.prediction_games.options[bet.prediction_games.correct_option_index!]}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getResultBadge(bet)}
                            <div className="text-sm text-muted-foreground">
                              Yatırılan: {bet.points_wagered}p
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PredictionProfile;
