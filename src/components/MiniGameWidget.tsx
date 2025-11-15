import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Gamepad2, Trophy, Clock, Zap, Brain, Keyboard } from "lucide-react";

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
  
  // Reaction game
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  
  // Memory game
  const [cards, setCards] = useState<Array<{ id: number; value: string; flipped: boolean; matched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  
  // Trivia game
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  
  // Typing game
  const [typingText, setTypingText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [typingStartTime, setTypingStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);

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
    
    if (game?.game_type === "reaction") {
      startReactionGame();
    } else if (game?.game_type === "memory") {
      startMemoryGame();
    } else if (game?.game_type === "trivia") {
      startTriviaGame();
    } else if (game?.game_type === "typing") {
      startTypingGame();
    }
  };

  // REACTION GAME
  const startReactionGame = () => {
    setReactionTime(null);
    setWaiting(true);
    const delay = Math.random() * 3000 + 1000;
    
    setTimeout(() => {
      setWaiting(false);
      setStartTime(Date.now());
    }, delay);
  };

  const handleReactionClick = async () => {
    if (waiting) {
      toast({ title: "Çok Erken!", description: "Yeşil ışık yanana kadar bekle", variant: "destructive" });
      setPlaying(false);
      setWaiting(false);
      return;
    }

    if (startTime === 0) return;

    const time = Date.now() - startTime;
    setReactionTime(time);
    const finalScore = Math.max(1000 - time, 0);
    setScore(finalScore);
    setPlaying(false);

    await saveScore(finalScore);
    toast({ title: "Harika!", description: `Tepki süreniz: ${time}ms` });
  };

  // MEMORY GAME
  const startMemoryGame = () => {
    const emojis = ["🎮", "🏆", "⚡", "🎯", "🎲", "🎪", "🎨", "🎭"];
    const gameCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        flipped: false,
        matched: false
      }));
    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].matched || cards[id].flipped) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      
      if (newCards[first].value === newCards[second].value) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setFlippedCards([]);
        
        if (newCards.every(card => card.matched)) {
          const finalScore = Math.max(1000 - moves * 10, 100);
          setScore(finalScore);
          setPlaying(false);
          saveScore(finalScore);
          toast({ title: "Tebrikler!", description: `${moves + 1} hamle ile tamamladın!` });
        }
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // TRIVIA GAME
  const startTriviaGame = () => {
    setCurrentQuestion(0);
    setTriviaScore(0);
    setAnswered(false);
  };

  const handleTriviaAnswer = async (answerIndex: number) => {
    if (answered) return;
    
    const questions = game?.config?.questions || [];
    const correct = questions[currentQuestion]?.correctAnswer === answerIndex;
    
    setAnswered(true);
    
    if (correct) {
      const newScore = triviaScore + 100;
      setTriviaScore(newScore);
      toast({ title: "Doğru!", description: "+100 puan" });
    } else {
      toast({ title: "Yanlış!", description: "Doğru cevap: " + questions[currentQuestion]?.options[questions[currentQuestion]?.correctAnswer], variant: "destructive" });
    }
    
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setAnswered(false);
      } else {
        setPlaying(false);
        setScore(triviaScore + (correct ? 100 : 0));
        saveScore(triviaScore + (correct ? 100 : 0));
        toast({ title: "Oyun Bitti!", description: `Toplam puan: ${triviaScore + (correct ? 100 : 0)}` });
      }
    }, 2000);
  };

  // TYPING GAME
  const startTypingGame = () => {
    const texts = [
      "Hızlı yazma oyununa hoş geldin!",
      "Başarı çalışmanın sonucudur.",
      "Oyunlar eğlenceli ve öğreticidir.",
    ];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    setTypingText(randomText);
    setUserInput("");
    setTypingStartTime(Date.now());
    setWpm(0);
  };

  const handleTypingInput = (value: string) => {
    setUserInput(value);
    
    if (value === typingText) {
      const timeElapsed = (Date.now() - typingStartTime) / 1000 / 60; // minutes
      const wordsTyped = typingText.split(" ").length;
      const calculatedWpm = Math.round(wordsTyped / timeElapsed);
      
      setWpm(calculatedWpm);
      const finalScore = calculatedWpm * 10;
      setScore(finalScore);
      setPlaying(false);
      saveScore(finalScore);
      toast({ title: "Tamamlandı!", description: `${calculatedWpm} WPM` });
    }
  };

  const saveScore = async (finalScore: number) => {
    const userId = localStorage.getItem("userId") || `guest_${Math.random()}`;
    localStorage.setItem("userId", userId);

    await supabase.from("mini_game_scores").insert({
      game_id: game!.id,
      user_identifier: userId,
      score: finalScore,
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

  const getGameIcon = () => {
    switch (game.game_type) {
      case "reaction": return <Zap className="w-5 h-5 text-primary" />;
      case "memory": return <Brain className="w-5 h-5 text-primary" />;
      case "trivia": return <Trophy className="w-5 h-5 text-primary" />;
      case "typing": return <Keyboard className="w-5 h-5 text-primary" />;
      default: return <Gamepad2 className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border-primary/20 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getGameIcon()}
          <h3 className="text-xl font-bold">{game.title}</h3>
        </div>
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Mini Oyun
        </Badge>
      </div>

      {/* REACTION GAME */}
      {game.game_type === "reaction" && (
        <>
          {!playing && reactionTime === null && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Ekran yeşil olunca hemen tıkla!</p>
              <Button onClick={startGame} className="w-full" size="lg">
                Başla
              </Button>
            </div>
          )}

          {playing && (
            <div
              className={`h-48 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                waiting ? "bg-red-500" : "bg-green-500"
              }`}
              onClick={handleReactionClick}
            >
              <p className="text-white text-2xl font-bold">
                {waiting ? "Bekle..." : "ŞİMDİ TIKLA!"}
              </p>
            </div>
          )}

          {reactionTime !== null && (
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">{reactionTime}ms</div>
              <div className="text-2xl font-semibold">{score} puan</div>
              <Button onClick={startGame} variant="outline" className="w-full">
                Tekrar Oyna
              </Button>
            </div>
          )}
        </>
      )}

      {/* MEMORY GAME */}
      {game.game_type === "memory" && (
        <>
          {!playing ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Eşleşen kartları bul!</p>
              <Button onClick={startGame} className="w-full" size="lg">
                Başla
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Hamle: {moves}</span>
                <span>Puan: {score}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`aspect-square rounded-lg text-3xl flex items-center justify-center transition-all ${
                      card.flipped || card.matched
                        ? "bg-primary text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    disabled={card.matched}
                  >
                    {card.flipped || card.matched ? card.value : "?"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* TRIVIA GAME */}
      {game.game_type === "trivia" && (
        <>
          {!playing ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Sorulara doğru cevap ver!</p>
              <Button onClick={startGame} className="w-full" size="lg">
                Başla
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Soru {currentQuestion + 1}/{game.config?.questions?.length || 0}</span>
                <span>Puan: {triviaScore}</span>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-lg">{game.config?.questions?.[currentQuestion]?.question}</p>
                <div className="grid gap-2">
                  {game.config?.questions?.[currentQuestion]?.options?.map((option: string, index: number) => (
                    <Button
                      key={index}
                      onClick={() => handleTriviaAnswer(index)}
                      variant={answered ? (game.config.questions[currentQuestion].correctAnswer === index ? "default" : "outline") : "outline"}
                      disabled={answered}
                      className="w-full"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TYPING GAME */}
      {game.game_type === "typing" && (
        <>
          {!playing && wpm === 0 ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Metni olabildiğince hızlı yaz!</p>
              <Button onClick={startGame} className="w-full" size="lg">
                Başla
              </Button>
            </div>
          ) : playing ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-mono">{typingText}</p>
              </div>
              <Input
                value={userInput}
                onChange={(e) => handleTypingInput(e.target.value)}
                placeholder="Buraya yaz..."
                autoFocus
                className="font-mono"
              />
              <div className="text-sm text-muted-foreground">
                {userInput.length}/{typingText.length} karakter
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">{wpm} WPM</div>
              <div className="text-2xl font-semibold">{score} puan</div>
              <Button onClick={startGame} variant="outline" className="w-full">
                Tekrar Oyna
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default MiniGameWidget;
