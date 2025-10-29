import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AICharacters from "@/components/AICharacters";
import ClipCreator from "@/components/ClipCreator";
import StreamMiniGames from "@/components/StreamMiniGames";
import CommunityVoting from "@/components/CommunityVoting";
import AIHighlightEditor from "@/components/AIHighlightEditor";
import MemeChatRoom from "@/components/MemeChatRoom";
import SocialSection from "@/components/SocialSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Scissors, Sparkles, Gamepad2, Vote, Wand2, MessageCircle, Share2 } from "lucide-react";

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
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 max-w-6xl mx-auto">
              <TabsTrigger value="characters">
                <Sparkles className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">AI Karakterler</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger value="clips">
                <Scissors className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Klip Oluştur</span>
                <span className="sm:hidden">Klip</span>
              </TabsTrigger>
              <TabsTrigger value="games">
                <Gamepad2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Mini Oyunlar</span>
                <span className="sm:hidden">Oyun</span>
              </TabsTrigger>
              <TabsTrigger value="voting">
                <Vote className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Oylama</span>
                <span className="sm:hidden">Oy</span>
              </TabsTrigger>
              <TabsTrigger value="highlights">
                <Wand2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">AI Editör</span>
                <span className="sm:hidden">Edit</span>
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageCircle className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sohbet</span>
                <span className="sm:hidden">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="social">
                <Share2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sosyal</span>
                <span className="sm:hidden">Link</span>
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

            <TabsContent value="chat">
              <MemeChatRoom />
            </TabsContent>

            <TabsContent value="social">
              <SocialSection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
