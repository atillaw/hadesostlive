import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flame, Sparkles, Dog, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: "user" | "character";
  content: string;
  character?: string;
}

const characters = [
  {
    id: "hades",
    name: "Hades",
    icon: Flame,
    color: "text-red-500",
    description: "Yeraltı dünyasının efendisi, sert ama adil",
    personality: "Sert, ironik, ama derin bilgeliğe sahip. Ölüm ve yeraltı dünyası hakkında konuşmayı sever.",
  },
  {
    id: "persephone",
    name: "Persephone",
    icon: Sparkles,
    color: "text-pink-400",
    description: "İlkbahar ve yeraltının kraliçesi, nazik ve bilge",
    personality: "Nazik, anlayışlı ve empatik. Doğa ve yeniden doğuş hakkında konuşmayı sever.",
  },
  {
    id: "cerberus",
    name: "Cerberus",
    icon: Dog,
    color: "text-orange-400",
    description: "Üç başlı bekçi köpeği, sadık ve koruyucu",
    personality: "Enerjik, sadık ve koruyucu. Basit ama etkili cevaplar verir, bazen köpek sesleri kullanır.",
  },
];

const AICharacters = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "character",
      content: `Selam, ben ${characters[0].name}. Seninle sohbet etmek için buradayım. Ne konuşmak istersin?`,
      character: characters[0].name,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulated AI response - in real implementation, this would call an AI API
    setTimeout(() => {
      const responses = {
        hades: [
          "Hmm, ilginç bir soru. Yeraltı dünyasında bunun cevabını bulmak kolay değil...",
          "Ölümlü, beni dinle. Bu konu hakkında sana önemli bir şey söyleyeceğim...",
          "Şimşeklerin parlaması gibi bir cevap! Ama ben Hades'im, onlardan daha güçlüyüm.",
        ],
        persephone: [
          "Ne güzel bir düşünce! İlkbaharda çiçekler gibi yeni fikirler açıyor...",
          "Anladım, senin bakış açın çok değerli. Bazen en karanlık zamanlarda bile umut vardır.",
          "Bu bana doğanın döngüsünü hatırlatıyor. Her şey bir sebepten değişir ve gelişir.",
        ],
        cerberus: [
          "Hav hav! *kuyruk sallama* İyi bir soru! Ben korumayı severim!",
          "Grrr... Yani, bu konuda dikkatli olmak gerek. Ben daima tetikte beklerim!",
          "*koku alır* Hmm, bu konu ilginç! Üç kafam da aynı fikirde!",
        ],
      };

      const characterResponses = responses[selectedCharacter.id as keyof typeof responses];
      const randomResponse = characterResponses[Math.floor(Math.random() * characterResponses.length)];

      const aiMessage: Message = {
        role: "character",
        content: randomResponse,
        character: selectedCharacter.name,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleCharacterChange = (character: typeof characters[0]) => {
    setSelectedCharacter(character);
    setMessages([
      {
        role: "character",
        content: `Selam, ben ${character.name}. Seninle sohbet etmek için buradayım. Ne konuşmak istersin?`,
        character: character.name,
      },
    ]);
  };

  return (
    <div className="grid lg:grid-cols-[300px,1fr] gap-6">
      {/* Character Selection */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">AI Karakterler</h3>
        <div className="space-y-2">
          {characters.map((character) => {
            const Icon = character.icon;
            return (
              <Card
                key={character.id}
                className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                  selectedCharacter.id === character.id
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/30 hover:border-primary/30"
                }`}
                onClick={() => handleCharacterChange(character)}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-8 w-8 ${character.color} flex-shrink-0`} />
                  <div>
                    <h4 className="font-bold">{character.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {character.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="glass border-primary/30 flex flex-col h-[600px]">
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = selectedCharacter.icon;
              return <Icon className={`h-6 w-6 ${selectedCharacter.color}`} />;
            })()}
            <div>
              <h3 className="font-bold">{selectedCharacter.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedCharacter.personality}</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/50 border border-border/30"
                  }`}
                >
                  {message.role === "character" && (
                    <p className="text-xs font-bold mb-1 opacity-70">{message.character}</p>
                  )}
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card/50 border border-border/30 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/30">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Mesajını yaz..."
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AICharacters;
