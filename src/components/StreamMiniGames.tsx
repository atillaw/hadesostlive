import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Gamepad2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Poll {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
}

interface Trivia {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  answered: boolean;
  points: number;
}

const StreamMiniGames = () => {
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [activeTrivia, setActiveTrivia] = useState<Trivia | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [userIdentifier, setUserIdentifier] = useState<string>("");
  const [canAnswerTrivia, setCanAnswerTrivia] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let userId = localStorage.getItem("user-identifier");
    if (!userId) {
      userId = `user_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("user-identifier", userId);
    }
    setUserIdentifier(userId);
    loadData(userId);
  }, []);

  const loadData = async (userId: string) => {
    setLoading(true);
    await Promise.all([
      loadActivePoll(userId),
      loadActiveTrivia(userId),
      loadUserScore(userId)
    ]);
    setLoading(false);
  };

  const loadActivePoll = async (userId: string) => {
    try {
      const { data: polls, error } = await supabase
        .from("live_polls")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (polls && polls.length > 0) {
        const poll = polls[0];
        
        // Get vote counts for each option
        const { data: votes } = await supabase
          .from("poll_votes")
          .select("option_index")
          .eq("poll_id", poll.id);

        const voteCounts = new Array((poll.options as any[]).length).fill(0);
        votes?.forEach(vote => {
          voteCounts[vote.option_index]++;
        });

        const optionsWithVotes = (poll.options as any[]).map((opt: any, idx: number) => ({
          text: opt.text,
          votes: voteCounts[idx]
        }));

        setActivePoll({
          id: poll.id,
          question: poll.question,
          options: optionsWithVotes
        });

        // Check if user has already voted
        const { data: userVote } = await supabase
          .from("poll_votes")
          .select("option_index")
          .eq("poll_id", poll.id)
          .eq("user_identifier", userId)
          .single();

        if (userVote) {
          setSelectedPollOption(userVote.option_index);
        }
      }
    } catch (error) {
      console.error("Error loading poll:", error);
    }
  };

  const loadActiveTrivia = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: questions, error } = await supabase
        .from("daily_trivia_questions")
        .select("*")
        .eq("active_date", today)
        .limit(1);

      if (error) throw error;

      if (questions && questions.length > 0) {
        const question = questions[0];
        
        // Check if user has answered in the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: userAnswer } = await supabase
          .from("trivia_answers")
          .select("*")
          .eq("question_id", question.id)
          .eq("user_identifier", userId)
          .gte("answered_at", twentyFourHoursAgo)
          .single();

        setActiveTrivia({
          id: question.id,
          question: question.question,
          options: question.options as string[],
          correctAnswer: question.correct_answer,
          answered: !!userAnswer,
          points: question.points
        });

        setCanAnswerTrivia(!userAnswer);
      }
    } catch (error) {
      console.error("Error loading trivia:", error);
    }
  };

  const loadUserScore = async (userId: string) => {
    try {
      const { data: answers, error } = await supabase
        .from("trivia_answers")
        .select("is_correct, daily_trivia_questions(points)")
        .eq("user_identifier", userId)
        .eq("is_correct", true);

      if (error) throw error;

      let totalScore = 0;
      answers?.forEach((answer: any) => {
        totalScore += answer.daily_trivia_questions?.points || 10;
      });

      setUserScore(totalScore);
    } catch (error) {
      console.error("Error loading score:", error);
    }
  };

  const handlePollVote = async (optionIndex: number) => {
    if (!activePoll || selectedPollOption !== null) return;

    try {
      const { error } = await supabase
        .from("poll_votes")
        .insert({
          poll_id: activePoll.id,
          user_identifier: userIdentifier,
          option_index: optionIndex
        });

      if (error) throw error;

      setSelectedPollOption(optionIndex);
      const newOptions = [...activePoll.options];
      newOptions[optionIndex].votes += 1;
      setActivePoll({ ...activePoll, options: newOptions });

      toast({
        title: "Oy Kaydedildi!",
        description: "Oyun için tercihin alındı.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Oy kaydedilemedi.",
        variant: "destructive",
      });
    }
  };

  const handleTriviaAnswer = async (answerIndex: number) => {
    if (!activeTrivia || activeTrivia.answered || !canAnswerTrivia) return;

    const isCorrect = answerIndex === activeTrivia.correctAnswer;

    try {
      const { error } = await supabase
        .from("trivia_answers")
        .insert({
          question_id: activeTrivia.id,
          user_identifier: userIdentifier,
          answer_index: answerIndex,
          is_correct: isCorrect
        });

      if (error) throw error;

      setActiveTrivia({ ...activeTrivia, answered: true });
      setCanAnswerTrivia(false);

      if (isCorrect) {
        setUserScore((prev) => prev + activeTrivia.points);
        toast({
          title: "Doğru Cevap! 🎉",
          description: `+${activeTrivia.points} puan kazandın!`,
        });
      } else {
        toast({
          title: "Yanlış Cevap",
          description: "Bir dahaki sefere!",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Cevap kaydedilemedi.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6 glass border-primary/30">
          <p className="text-center text-muted-foreground">Yükleniyor...</p>
        </Card>
      </div>
    );
  }

  if (!activePoll && !activeTrivia) {
    return (
      <div className="space-y-6">
        <Card className="p-6 glass border-primary/30">
          <p className="text-center text-muted-foreground">Şu anda aktif anket veya yarışma yok.</p>
        </Card>
      </div>
    );
  }

  const totalVotes = activePoll ? activePoll.options.reduce((sum, opt) => sum + opt.votes, 0) : 0;

  return (
    <div className="space-y-6">
      {/* User Score */}
      <Card className="p-4 glass border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <div>
              <p className="text-sm text-muted-foreground">Toplam Puanın</p>
              <p className="text-2xl font-bold">{userScore}</p>
            </div>
          </div>
          <Gamepad2 className="h-8 w-8 text-primary opacity-50" />
        </div>
      </Card>

      {/* Active Poll */}
      {activePoll && (
        <Card className="p-6 glass border-primary/30">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Canlı Anket</h3>
            </div>

            <p className="text-lg font-medium">{activePoll.question}</p>

          <div className="space-y-3">
            {activePoll.options.map((option, index) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              const isSelected = selectedPollOption === index;

              return (
                <div key={index} className="space-y-2">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className="w-full justify-between h-auto py-3"
                    onClick={() => handlePollVote(index)}
                    disabled={selectedPollOption !== null}
                  >
                    <span>{option.text}</span>
                    <span className="font-bold">{option.votes}</span>
                  </Button>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>

            <p className="text-sm text-muted-foreground text-center">
              Toplam {totalVotes} oy
            </p>
          </div>
        </Card>
      )}

      {/* Trivia Challenge */}
      {activeTrivia && (
        <Card className="p-6 glass border-primary/30">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-400" />
              <h3 className="text-xl font-bold">Bilgi Yarışması</h3>
            </div>

            {!canAnswerTrivia && !activeTrivia.answered && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-sm text-center text-yellow-500">
                  Son 24 saat içinde cevap verdiniz. Yarın tekrar deneyin!
                </p>
              </div>
            )}

            <p className="text-lg font-medium">{activeTrivia.question}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeTrivia.options.map((option, index) => {
              const isCorrect = index === activeTrivia.correctAnswer;
              const showResult = activeTrivia.answered;

              return (
                <Button
                  key={index}
                  variant={
                    showResult && isCorrect
                      ? "default"
                      : showResult
                      ? "outline"
                      : "outline"
                  }
                  className={`h-auto py-4 ${
                    showResult && isCorrect
                      ? "bg-green-500/20 border-green-500/50 hover:bg-green-500/30"
                      : ""
                  }`}
                  onClick={() => handleTriviaAnswer(index)}
                  disabled={activeTrivia.answered || !canAnswerTrivia}
                >
                  {option}
                  {showResult && isCorrect && (
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  )}
                </Button>
              );
            })}
          </div>

          {activeTrivia.answered && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm text-center">
                Doğru cevap:{" "}
                <span className="font-bold">
                  {activeTrivia.options[activeTrivia.correctAnswer]}
                </span>
              </p>
            </div>
          )}

            <p className="text-sm text-muted-foreground text-center">
              Her doğru cevap +{activeTrivia.points} puan kazandırır
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StreamMiniGames;
