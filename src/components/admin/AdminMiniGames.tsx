import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, X, Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PollOption {
  text: string;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  active: boolean;
  created_at: string;
}

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  active_date: string;
  points: number;
}

const AdminMiniGames = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Poll form state
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", "", "", ""]);

  // Trivia form state
  const [triviaQuestion, setTriviaQuestion] = useState("");
  const [triviaOptions, setTriviaOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [points, setPoints] = useState(10);

  useEffect(() => {
    loadData();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const pollsChannel = supabase
      .channel("live_polls_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_polls",
        },
        () => {
          loadPolls();
        }
      )
      .subscribe();

    const triviaChannel = supabase
      .channel("trivia_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_trivia_questions",
        },
        () => {
          loadTriviaQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pollsChannel);
      supabase.removeChannel(triviaChannel);
    };
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadPolls(), loadTriviaQuestions()]);
    setLoading(false);
  };

  const loadPolls = async () => {
    try {
      const { data, error } = await supabase
        .from("live_polls")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPolls((data || []).map(poll => ({
        ...poll,
        options: poll.options as unknown as PollOption[]
      })));
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Anketler yüklenemedi: " + error.message,
        variant: "destructive",
      });
    }
  };

  const loadTriviaQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_trivia_questions")
        .select("*")
        .order("active_date", { ascending: false });

      if (error) throw error;
      setTriviaQuestions((data || []).map(trivia => ({
        ...trivia,
        options: trivia.options as unknown as string[]
      })));
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Sorular yüklenemedi: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreatePoll = async () => {
    const validOptions = pollOptions.filter(opt => opt.trim() !== "");
    
    if (!pollQuestion.trim() || validOptions.length < 2) {
      toast({
        title: "Hata",
        description: "Lütfen soru ve en az 2 seçenek girin.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("live_polls")
        .insert({
          question: pollQuestion,
          options: validOptions.map(text => ({ text })),
          active: true
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Anket oluşturuldu.",
      });

      setPollQuestion("");
      setPollOptions(["", "", "", ""]);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateTrivia = async () => {
    const validOptions = triviaOptions.filter(opt => opt.trim() !== "");
    
    if (!triviaQuestion.trim() || validOptions.length < 2) {
      toast({
        title: "Hata",
        description: "Lütfen soru ve en az 2 seçenek girin.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("daily_trivia_questions")
        .insert({
          question: triviaQuestion,
          options: validOptions,
          correct_answer: correctAnswer,
          active_date: activeDate,
          points: points
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Bilgi yarışması sorusu oluşturuldu.",
      });

      setTriviaQuestion("");
      setTriviaOptions(["", "", "", ""]);
      setCorrectAnswer(0);
      setActiveDate(new Date().toISOString().split('T')[0]);
      setPoints(10);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePoll = async (id: string) => {
    if (!confirm("Bu anketi silmek istediğinize emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("live_polls")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Anket silindi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTrivia = async (id: string) => {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("daily_trivia_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Soru silindi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTogglePollActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("live_polls")
        .update({ active: !active })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `Anket ${!active ? "aktif" : "pasif"} edildi.`,
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Mini Oyunlar Yönetimi</h2>
        <p className="text-muted-foreground">Canlı anketler ve bilgi yarışması sorularını yönetin.</p>
      </div>

      <Tabs defaultValue="polls" className="space-y-6">
        <TabsList>
          <TabsTrigger value="polls">Canlı Anketler</TabsTrigger>
          <TabsTrigger value="trivia">Bilgi Yarışması</TabsTrigger>
        </TabsList>

        <TabsContent value="polls" className="space-y-6">
          {/* Create Poll Form */}
          <Card>
            <CardHeader>
              <CardTitle>Yeni Anket Oluştur</CardTitle>
              <CardDescription>Topluluk için yeni bir anket oluşturun.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="poll-question">Anket Sorusu</Label>
                <Input
                  id="poll-question"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Hangi oyunu oynayalım?"
                />
              </div>

              <div className="space-y-2">
                <Label>Seçenekler (en az 2)</Label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...pollOptions];
                        newOptions[index] = e.target.value;
                        setPollOptions(newOptions);
                      }}
                      placeholder={`Seçenek ${index + 1}`}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOptions = pollOptions.filter((_, i) => i !== index);
                          setPollOptions(newOptions);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPollOptions([...pollOptions, ""])}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Seçenek Ekle
                </Button>
              </div>

              <Button onClick={handleCreatePoll}>Anket Oluştur</Button>
            </CardContent>
          </Card>

          {/* Polls List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Mevcut Anketler ({polls.length})</h3>
            {polls.map((poll) => (
              <Card key={poll.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{poll.question}</CardTitle>
                      <CardDescription>
                        {new Date(poll.created_at).toLocaleDateString("tr-TR")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={poll.active}
                          onCheckedChange={() => handleTogglePollActive(poll.id, poll.active)}
                        />
                        <span className="text-sm">{poll.active ? "Aktif" : "Pasif"}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePoll(poll.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {poll.options.map((option, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        {idx + 1}. {option.text}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trivia" className="space-y-6">
          {/* Create Trivia Form */}
          <Card>
            <CardHeader>
              <CardTitle>Yeni Bilgi Yarışması Sorusu</CardTitle>
              <CardDescription>Günlük bilgi yarışması için soru oluşturun.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trivia-question">Soru</Label>
                <Input
                  id="trivia-question"
                  value={triviaQuestion}
                  onChange={(e) => setTriviaQuestion(e.target.value)}
                  placeholder="Hades mitolojide kimin kardeşidir?"
                />
              </div>

              <div className="space-y-2">
                <Label>Seçenekler</Label>
                {triviaOptions.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="radio"
                      name="correct"
                      checked={correctAnswer === index}
                      onChange={() => setCorrectAnswer(index)}
                      className="cursor-pointer"
                    />
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...triviaOptions];
                        newOptions[index] = e.target.value;
                        setTriviaOptions(newOptions);
                      }}
                      placeholder={`Seçenek ${index + 1}`}
                    />
                    {triviaOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOptions = triviaOptions.filter((_, i) => i !== index);
                          setTriviaOptions(newOptions);
                          if (correctAnswer >= newOptions.length) {
                            setCorrectAnswer(0);
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTriviaOptions([...triviaOptions, ""])}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Seçenek Ekle
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="active-date">Aktif Tarih</Label>
                  <Input
                    id="active-date"
                    type="date"
                    value={activeDate}
                    onChange={(e) => setActiveDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="points">Puan</Label>
                  <Input
                    id="points"
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
                    min={1}
                  />
                </div>
              </div>

              <Button onClick={handleCreateTrivia}>Soru Oluştur</Button>
            </CardContent>
          </Card>

          {/* Trivia Questions List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Sorular ({triviaQuestions.length})</h3>
            {triviaQuestions.map((trivia) => (
              <Card key={trivia.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{trivia.question}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(trivia.active_date).toLocaleDateString("tr-TR")}
                        <span className="ml-2">• {trivia.points} puan</span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTrivia(trivia.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {trivia.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`text-sm ${
                          idx === trivia.correct_answer
                            ? "font-bold text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {idx + 1}. {option}
                        {idx === trivia.correct_answer && " ✓"}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMiniGames;