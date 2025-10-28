import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AICharacters from "@/components/AICharacters";
import ClipCreator from "@/components/ClipCreator";
import StreamMiniGames from "@/components/StreamMiniGames";
import CommunityVoting from "@/components/CommunityVoting";
import AIHighlightEditor from "@/components/AIHighlightEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Scissors, Sparkles, Gamepad2, Vote, Wand2 } from "lucide-react";

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold glow-text">
              Topluluk Özellikleri
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI karakterlerle sohbet et, anında klip oluştur ve daha fazlası
            </p>
          </div>

          <Tabs defaultValue="characters" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
              <TabsTrigger value="characters">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Karakterler
              </TabsTrigger>
              <TabsTrigger value="clips">
                <Scissors className="mr-2 h-4 w-4" />
                Klip Oluştur
              </TabsTrigger>
              <TabsTrigger value="games">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Mini Oyunlar
              </TabsTrigger>
              <TabsTrigger value="voting">
                <Vote className="mr-2 h-4 w-4" />
                Oylama
              </TabsTrigger>
              <TabsTrigger value="highlights">
                <Wand2 className="mr-2 h-4 w-4" />
                AI Editör
              </TabsTrigger>
            </TabsList>

            <TabsContent value="characters">
              <AICharacters />
            </TabsContent>

            <TabsContent value="clips">
              <ClipCreator />
            </TabsContent>

            <TabsContent value="games">
              <StreamMiniGames />
            </TabsContent>

            <TabsContent value="voting">
              <CommunityVoting />
            </TabsContent>

            <TabsContent value="highlights">
              <AIHighlightEditor />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
