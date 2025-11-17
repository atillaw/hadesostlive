import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface MiniGame {
  id: string;
  title: string;
  game_type: string;
  config: any;
  is_active: boolean;
  created_at: string;
  ends_at: string | null;
}

const AdminGameTypes = () => {
  const [games, setGames] = useState<MiniGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGame, setNewGame] = useState({
    title: "",
    game_type: "reaction",
    config: {},
  });

  const gameTypes = [
    { value: "reaction", label: "Reaction Time" },
    { value: "memory", label: "Memory Card Game" },
    { value: "trivia", label: "Trivia Quiz" },
    { value: "typing", label: "Typing Speed Test" },
  ];

  const getDefaultConfig = (gameType: string) => {
    switch (gameType) {
      case "memory":
        return { pairs: 8, timeLimit: 120 };
      case "trivia":
        return { 
          questions: [
            {
              question: "Örnek soru?",
              options: ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
              correctAnswer: 0
            }
          ],
          timePerQuestion: 30
        };
      case "typing":
        return { text: "Hızlı yazmak için bu metni yazın...", timeLimit: 60 };
      case "reaction":
      default:
        return { rounds: 5 };
    }
  };

  useEffect(() => {
    loadGames();
    
    const channel = supabase
      .channel('mini-games-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mini_games'
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
        .from("mini_games")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error("Error loading games:", error);
      toast({
        title: "Hata",
        description: "Oyunlar yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    if (!newGame.title.trim()) {
      toast({
        title: "Hata",
        description: "Oyun başlığı gerekli",
        variant: "destructive",
      });
      return;
    }

    const gameConfig = newGame.config && Object.keys(newGame.config).length > 0 
      ? newGame.config 
      : getDefaultConfig(newGame.game_type);

    const { error } = await supabase.from("mini_games").insert({
      ...newGame,
      config: gameConfig,
    });

    if (error) {
      toast({
        title: "Hata",
        description: "Oyun oluşturulamadı",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Oyun oluşturuldu",
      });
      setNewGame({ title: "", game_type: "reaction", config: {} });
      loadGames();
    }
  };

  const handleToggleActive = async (gameId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("mini_games")
      .update({ is_active: isActive })
      .eq("id", gameId);

    if (error) {
      toast({
        title: "Hata",
        description: "Oyun durumu güncellenemedi",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: isActive ? "Oyun aktif edildi" : "Oyun pasif edildi",
      });
      loadGames();
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!confirm("Bu oyunu silmek istediğinizden emin misiniz?")) return;

    const { error } = await supabase.from("mini_games").delete().eq("id", id);

    if (error) {
      toast({
        title: "Hata",
        description: "Oyun silinemedi",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Oyun silindi",
      });
      loadGames();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Mini Oyun Oluştur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Oyun Başlığı</Label>
            <Input
              value={newGame.title}
              onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
              placeholder="Örn: Hafıza Oyunu Challenge"
            />
          </div>
          
          <div>
            <Label>Oyun Tipi</Label>
            <Select
              value={newGame.game_type}
              onValueChange={(value) =>
                setNewGame({ 
                  ...newGame, 
                  game_type: value,
                  config: getDefaultConfig(value)
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gameTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Konfigürasyon (JSON)</Label>
            <Textarea
              value={JSON.stringify(newGame.config || getDefaultConfig(newGame.game_type), null, 2)}
              onChange={(e) => {
                try {
                  setNewGame({ ...newGame, config: JSON.parse(e.target.value) });
                } catch {}
              }}
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <Button onClick={handleCreateGame} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Oyun Oluştur
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mevcut Oyunlar ({games.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Yükleniyor...</p>
          ) : games.length === 0 ? (
            <p className="text-muted-foreground">Henüz oyun oluşturulmamış</p>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <div key={game.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{game.title}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{game.game_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={game.is_active}
                        onCheckedChange={(checked) => handleToggleActive(game.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGame(game.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <pre className="bg-muted p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(game.config, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGameTypes;
