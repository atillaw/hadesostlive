import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, Target, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PredictionGame {
  id: string;
  title: string;
  description: string | null;
  options: any;
  status: string;
  closes_at: string;
  correct_option_index: number | null;
  created_at: string;
}

const AdminPredictionGames = () => {
  const [games, setGames] = useState<PredictionGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGame, setNewGame] = useState({
    title: "",
    description: "",
    options: ["", ""],
    closes_at: "",
  });

  useEffect(() => {
    loadGames();
    
    const channel = supabase
      .channel('prediction-games-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prediction_games'
        },
        () => loadGames()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadGames = async () => {
    try {
      const { data, error } = await supabase
        .from("prediction_games")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error("Error loading games:", error);
      toast({
        title: "Hata",
        description: "Tahmin oyunları yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    if (!newGame.title || !newGame.closes_at || newGame.options.some(opt => !opt.trim())) {
      toast({
        title: "Hata",
        description: "Tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("prediction_games").insert({
        title: newGame.title,
        description: newGame.description || null,
        options: newGame.options.map(text => ({ text, count: 0 })),
        closes_at: newGame.closes_at,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Tahmin oyunu oluşturuldu",
      });

      setNewGame({ title: "", description: "", options: ["", ""], closes_at: "" });
      loadGames();
    } catch (error) {
      console.error("Error creating game:", error);
      toast({
        title: "Hata",
        description: "Tahmin oyunu oluşturulamadı",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!confirm("Bu tahmin oyununu silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase.from("prediction_games").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Tahmin oyunu silindi",
      });

      loadGames();
    } catch (error) {
      console.error("Error deleting game:", error);
      toast({
        title: "Hata",
        description: "Tahmin oyunu silinemedi",
        variant: "destructive",
      });
    }
  };

  const handleSetWinner = async (gameId: string, optionIndex: number) => {
    try {
      const { error } = await supabase
        .from("prediction_games")
        .update({ 
          correct_option_index: optionIndex,
          status: "closed"
        })
        .eq("id", gameId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Kazanan seçenek belirlendi",
      });

      loadGames();
    } catch (error) {
      console.error("Error setting winner:", error);
      toast({
        title: "Hata",
        description: "Kazanan belirlenemedi",
        variant: "destructive",
      });
    }
  };

  const handleCloseGame = async (gameId: string) => {
    try {
      const { error } = await supabase
        .from("prediction_games")
        .update({ status: "closed" })
        .eq("id", gameId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Tahmin oyunu kapatıldı",
      });

      loadGames();
    } catch (error) {
      console.error("Error closing game:", error);
      toast({
        title: "Hata",
        description: "Oyun kapatılamadı",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Tahmin Oyunları Yönetimi</h2>
        <p className="text-muted-foreground">Canlı yayın için tahmin oyunları oluşturun ve yönetin</p>
      </div>

      {/* Create New Game */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Yeni Tahmin Oyunu Oluştur</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              placeholder="örn: Maçı kim kazanır?"
              value={newGame.title}
              onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Açıklama (opsiyonel)</Label>
            <Textarea
              id="description"
              placeholder="Oyun hakkında detaylar..."
              value={newGame.description}
              onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Seçenekler</Label>
            {newGame.options.map((option, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  placeholder={`Seçenek ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newGame.options];
                    newOptions[index] = e.target.value;
                    setNewGame({ ...newGame, options: newOptions });
                  }}
                />
                {newGame.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newOptions = newGame.options.filter((_, i) => i !== index);
                      setNewGame({ ...newGame, options: newOptions });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setNewGame({ ...newGame, options: [...newGame.options, ""] })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Seçenek Ekle
            </Button>
          </div>
          <div>
            <Label htmlFor="closes_at">Kapanış Zamanı</Label>
            <Input
              id="closes_at"
              type="datetime-local"
              value={newGame.closes_at}
              onChange={(e) => setNewGame({ ...newGame, closes_at: e.target.value })}
            />
          </div>
          <Button onClick={handleCreateGame} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Oyun Oluştur
          </Button>
        </div>
      </Card>

      {/* Games List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tahmin Oyunları ({games.length})</h3>
        {games.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Henüz tahmin oyunu oluşturulmamış
          </Card>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <Card key={game.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{game.title}</h4>
                      <Badge variant={game.status === "active" ? "default" : "secondary"}>
                        {game.status === "active" ? "Aktif" : "Kapandı"}
                      </Badge>
                    </div>
                    {game.description && (
                      <p className="text-sm text-muted-foreground mb-2">{game.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Kapanış: {new Date(game.closes_at).toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGame(game.id)}
                    className="hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  {game.options.map((option: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        game.correct_option_index === index
                          ? "bg-green-500/10 border-green-500/50"
                          : "bg-card/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{option.text}</span>
                        {game.correct_option_index === index && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{option.count || 0} tahmin</Badge>
                        {game.status === "active" && game.correct_option_index === null && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetWinner(game.id, index)}
                          >
                            Kazanan
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {game.status === "active" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCloseGame(game.id)}
                  >
                    Oyunu Kapat
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPredictionGames;
