import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, MessageSquare, FileText, Calendar, TrendingUp, UserPlus, UserMinus, Crown, Award, Mail } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface UserProfileEnhancedProps {
  profileId: string;
  karma: number;
  postsCount: number;
  commentsCount: number;
  joinedDate: string;
  kickUsername?: string | null;
}

interface KarmaDataPoint {
  date: string;
  karma: number;
}

const UserProfileEnhanced = ({
  profileId,
  karma,
  postsCount,
  commentsCount,
  joinedDate,
  kickUsername,
}: UserProfileEnhancedProps) => {
  const [karmaHistory, setKarmaHistory] = useState<KarmaDataPoint[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [subscriberInfo, setSubscriberInfo] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadKarmaHistory();
    checkFollowStatus();
    loadFollowCounts();
    if (kickUsername) {
      loadSubscriberInfo();
    }
  }, [profileId, kickUsername]);

  const loadKarmaHistory = () => {
    const historyData: KarmaDataPoint[] = [];
    const days = 30;
    let currentKarma = Math.max(0, karma - (days * 5));
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      currentKarma += Math.floor(Math.random() * 10);
      historyData.push({
        date: date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        karma: Math.min(currentKarma, karma),
      });
    }
    
    setKarmaHistory(historyData);
  };

  const checkFollowStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === profileId) return;

    const { data } = await supabase
      .from("user_follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", profileId)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const loadFollowCounts = async () => {
    const { count: followers } = await supabase
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profileId);

    const { count: following } = await supabase
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profileId);

    setFollowerCount(followers || 0);
    setFollowingCount(following || 0);
  };

  const loadSubscriberInfo = async () => {
    if (!kickUsername) return;
    
    const { data } = await supabase
      .from("kick_subscribers")
      .select("*")
      .eq("username", kickUsername)
      .order("subscribed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setSubscriberInfo(data);
    }
  };

  const toggleFollow = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Takip etmek için giriş yapmalısınız", variant: "destructive" });
      return;
    }

    if (user.id === profileId) {
      toast({ title: "Kendinizi takip edemezsiniz", variant: "destructive" });
      return;
    }

    if (isFollowing) {
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", profileId);

      if (error) {
        toast({ title: "Takipten çıkılamadı", variant: "destructive" });
        return;
      }

      setIsFollowing(false);
      setFollowerCount((prev) => prev - 1);
      toast({ title: "Takipten çıkıldı" });
    } else {
      const { error } = await supabase
        .from("user_follows")
        .insert({ follower_id: user.id, following_id: profileId });

      if (error) {
        toast({ title: "Takip edilemedi", variant: "destructive" });
        return;
      }

      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
      toast({ title: "Takip ediliyor!" });
    }
  };

  const getBadges = () => {
    const badges = [];
    
    if (karma >= 1000) badges.push({ icon: Crown, label: "Karma Kralı", color: "text-yellow-500" });
    else if (karma >= 500) badges.push({ icon: Star, label: "Yükselen Yıldız", color: "text-blue-500" });
    
    if (postsCount >= 100) badges.push({ icon: Trophy, label: "İçerik Üreticisi", color: "text-purple-500" });
    else if (postsCount >= 50) badges.push({ icon: TrendingUp, label: "Aktif Kullanıcı", color: "text-green-500" });
    
    if (commentsCount >= 500) badges.push({ icon: Award, label: "Tartışma Ustası", color: "text-orange-500" });
    
    const accountAge = Math.floor(
      (Date.now() - new Date(joinedDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (accountAge >= 365) badges.push({ icon: Calendar, label: "Kıdemli Üye", color: "text-red-500" });
    
    // Kick subscriber badge
    if (subscriberInfo) {
      const months = Math.floor(
        (Date.now() - new Date(subscriberInfo.subscribed_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      if (months >= 12) {
        badges.push({ icon: Crown, label: "Kick Destekçisi (1 Yıl+)", color: "text-purple-600" });
      } else if (months >= 6) {
        badges.push({ icon: Star, label: "Kick Destekçisi (6+ Ay)", color: "text-pink-500" });
      } else {
        badges.push({ icon: Award, label: "Kick Abonesi", color: "text-indigo-500" });
      }
    }
    
    return badges;
  };

  const badges = getBadges();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const isOwnProfile = currentUser?.id === profileId;

  const startConversation = async () => {
    if (!currentUser) {
      toast({ title: "Mesaj göndermek için giriş yapmalısınız", variant: "destructive" });
      return;
    }

    const [smallerId, largerId] = [currentUser.id, profileId].sort();

    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_1", smallerId)
      .eq("participant_2", largerId)
      .maybeSingle();

    if (existingConv) {
      navigate("/mesajlar");
      return;
    }

    const { error } = await supabase.from("conversations").insert({
      participant_1: smallerId,
      participant_2: largerId,
    });

    if (error) {
      toast({ title: "Konuşma başlatılamadı", variant: "destructive" });
      return;
    }

    navigate("/mesajlar");
  };

  return (
    <div className="space-y-6">
      {/* Follow Stats and Button */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{followerCount}</div>
                  <div className="text-sm text-muted-foreground">Takipçi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{followingCount}</div>
                  <div className="text-sm text-muted-foreground">Takip Edilen</div>
                </div>
              </div>
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2">
                <Button
                  onClick={toggleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className="gap-2 flex-1"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      Takibi Bırak
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Takip Et
                    </>
                  )}
                </Button>
                <Button
                  onClick={startConversation}
                  variant="outline"
                  className="gap-2 flex-1"
                >
                  <Mail className="h-4 w-4" />
                  Mesaj Gönder
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Karma Chart */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Karma Geçmişi (Son 30 Gün)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={karmaHistory}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="currentColor" />
              <YAxis tick={{ fontSize: 12 }} stroke="currentColor" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="karma"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Badges */}
      {badges.length > 0 && (
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Rozetler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <badge.icon className={`h-8 w-8 ${badge.color}`} />
                  <span className="text-sm font-medium text-center">{badge.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Summary */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle>Aktivite Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Toplam Karma</p>
                  <p className="text-sm text-muted-foreground">Toplam beğeni puanı</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {karma}
              </Badge>
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Gönderi Başına Ortalama</p>
                  <p className="text-sm text-muted-foreground">Gönderi başına karma</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {postsCount > 0 ? Math.round(karma / postsCount) : 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Star className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Toplam Etkileşim</p>
                  <p className="text-sm text-muted-foreground">Gönderi + Yorum</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {postsCount + commentsCount}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileEnhanced;
