import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Trophy, Star, Calendar, Loader2 } from "lucide-react";

interface Subscriber {
  id: string;
  username: string;
  subscription_tier: string;
  subscribed_at: string;
  follower_since: string | null;
  subscription_type: string | null;
}

const getSubscriptionMonths = (subscribedAt: string) => {
  const now = new Date();
  const subscribedDate = new Date(subscribedAt);
  const months = Math.floor((now.getTime() - subscribedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  return Math.max(1, months);
};

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 1:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 2:
      return <Trophy className="h-5 w-5 text-amber-600" />;
    default:
      return <Star className="h-4 w-4 text-muted-foreground" />;
  }
};

const getRankBadgeStyle = (index: number) => {
  switch (index) {
    case 0:
      return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0";
    case 1:
      return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 border-0";
    case 2:
      return "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0";
    default:
      return "bg-muted";
  }
};

export const KickSubscriberLeaderboard = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    const { data, error } = await supabase
      .from("kick_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Failed to load subscribers:", error);
    } else {
      setSubscribers(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            En Uzun Süreli Aboneler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subscribers.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            En Uzun Süreli Aboneler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Henüz abone bulunmuyor
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          En Uzun Süreli Aboneler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {subscribers.map((subscriber, index) => {
          const months = getSubscriptionMonths(subscriber.subscribed_at);
          return (
            <div 
              key={subscriber.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02] ${
                index < 3 ? "bg-gradient-to-r from-primary/5 to-transparent" : "bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(index)}
              </div>
              
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarImage src={`https://kick.com/api/v2/channels/${subscriber.username}/profile-image`} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {subscriber.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{subscriber.username}</span>
                  <Badge variant="secondary" className="text-xs">
                    {subscriber.subscription_tier}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(subscriber.subscribed_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              <Badge className={getRankBadgeStyle(index)}>
                {months} ay
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default KickSubscriberLeaderboard;
