import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Crown, Zap, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const ImpactPoints = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("100");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);

  const pointTiers = [
    { name: "Bronze", points: 100, icon: Star, color: "text-orange-400" },
    { name: "Silver", points: 500, icon: Zap, color: "text-gray-300" },
    { name: "Gold", points: 1000, icon: Trophy, color: "text-yellow-400" },
    { name: "Platinum", points: 5000, icon: Crown, color: "text-purple-400" },
    { name: "Diamond", points: 10000, icon: Crown, color: "text-cyan-400" },
  ];

  const benefits = [
    "Increase chat visibility and priority",
    "Exclusive badges and profile customization",
    "Vote power in community decisions",
    "Early access to new features",
    "Priority support responses",
    "Special emotes and reactions",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold glow-text">
              Impact Points System
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Support the stream with Impact Points. Earn points, climb the leaderboard, and unlock exclusive benefits!
            </p>
          </div>

          <Tabs defaultValue="contribute" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="contribute">Contribute</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
            </TabsList>

            {/* Contribute Tab */}
            <TabsContent value="contribute" className="space-y-8">
              <Card className="p-8 glass border-primary/30">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-primary" />
                    <h2 className="text-2xl font-bold">Get Impact Points</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Amount (TL)</label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="text-lg"
                      />
                    </div>
                    
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">You'll receive:</span>
                        <span className="text-2xl font-bold text-primary">
                          {parseInt(amount) || 0} Points
                        </span>
                      </div>
                    </div>

                    <Button className="w-full h-12 text-lg" size="lg">
                      <Zap className="mr-2 h-5 w-5" />
                      Purchase Impact Points
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Tier Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pointTiers.map((tier) => {
                  const Icon = tier.icon;
                  return (
                    <Card key={tier.name} className="p-6 glass border-primary/20 hover:border-primary/50 transition-all hover:scale-105">
                      <div className="space-y-3 text-center">
                        <Icon className={`h-10 w-10 mx-auto ${tier.color}`} />
                        <h3 className="text-xl font-bold">{tier.name}</h3>
                        <p className="text-2xl font-bold text-primary">{tier.points.toLocaleString()}+</p>
                        <p className="text-sm text-muted-foreground">Points Required</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-6">
              <Card className="p-8 glass border-primary/30">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">Weekly Leaderboard</h2>
                </div>
                
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-card/50 hover:bg-card/70 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className={`text-2xl font-bold ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                          #{i + 1}
                        </span>
                        <div>
                          <p className="font-medium">User {i + 1}</p>
                          <p className="text-sm text-muted-foreground">
                            {(Math.random() * 10000).toFixed(0)} points
                          </p>
                        </div>
                      </div>
                      {i < 3 && <Crown className={`h-6 w-6 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-orange-400'}`} />}
                    </div>
                  ))}
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Leaderboard resets every Monday at 00:00
                </p>
              </Card>
            </TabsContent>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-6">
              <Card className="p-8 glass border-primary/30">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">Impact Points Benefits</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card/50">
                      <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p>{benefit}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 rounded-lg bg-primary/10 border border-primary/30">
                  <h3 className="text-xl font-bold mb-3">How It Works</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• 1 TL = 1 Impact Point</li>
                    <li>• Points never expire (except weekly leaderboard resets)</li>
                    <li>• Higher points = Higher visibility in chat and votes</li>
                    <li>• Unlock new tiers by accumulating points</li>
                    <li>• Support the creator while gaining exclusive perks</li>
                  </ul>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImpactPoints;
