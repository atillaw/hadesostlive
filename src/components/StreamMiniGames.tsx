import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Gamepad2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Poll {
  question: string;
  options: { text: string; votes: number }[];
}

interface Trivia {
  question: string;
  options: string[];
  correctAnswer: number;
  answered: boolean;
}

const StreamMiniGames = () => {
  const [activePoll, setActivePoll] = useState<Poll>({
    question: "Hangi oyunu oynayalım?",
    options: [
      { text: "League of Legends", votes: 45 },
      { text: "Valorant", votes: 32 },
      { text: "CS:GO", votes: 28 },
      { text: "Minecraft", votes: 15 },
    ],
  });

  const [activeTrivia, setActiveTrivia] = useState<Trivia>({
    question: "Hades mitolojide kimin kardeşidir?",
    options: ["Zeus", "Poseidon", "Her ikisi de", "Apollo"],
    correctAnswer: 2,
    answered: false,
  });

  const [userScore, setUserScore] = useState(150);
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const { toast } = useToast();

  const handlePollVote = (optionIndex: number) => {
    if (selectedPollOption !== null) return;

    setSelectedPollOption(optionIndex);
    const newOptions = [...activePoll.options];
    newOptions[optionIndex].votes += 1;
    setActivePoll({ ...activePoll, options: newOptions });

    toast({
      title: "Oy Kaydedildi!",
      description: "Oyun için tercihin alındı.",
    });
  };

  const handleTriviaAnswer = (answerIndex: number) => {
    if (activeTrivia.answered) return;

    const isCorrect = answerIndex === activeTrivia.correctAnswer;
    setActiveTrivia({ ...activeTrivia, answered: true });

    if (isCorrect) {
      setUserScore((prev) => prev + 10);
      toast({
        title: "Doğru Cevap! 🎉",
        description: "+10 puan kazandın!",
      });
    } else {
      toast({
        title: "Yanlış Cevap",
        description: "Bir dahaki sefere!",
        variant: "destructive",
      });
    }
  };

  const totalVotes = activePoll.options.reduce((sum, opt) => sum + opt.votes, 0);

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

      {/* Trivia Challenge */}
      <Card className="p-6 glass border-primary/30">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <h3 className="text-xl font-bold">Bilgi Yarışması</h3>
          </div>

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
                  disabled={activeTrivia.answered}
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
            Her doğru cevap +10 puan kazandırır
          </p>
        </div>
      </Card>
    </div>
  );
};

export default StreamMiniGames;
