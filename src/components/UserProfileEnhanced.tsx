import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Award, Calendar, Crown, Star } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface UserProfileEnhancedProps {
  karma: number;
  postsCount: number;
  commentsCount: number;
  joinedDate: string;
}

const UserProfileEnhanced = ({
  karma,
  postsCount,
  commentsCount,
  joinedDate,
}: UserProfileEnhancedProps) => {
  // Calculate badges
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
    
    return badges;
  };

  // Generate mock karma history data
  const generateKarmaData = () => {
    const data = [];
    const days = 30;
    let currentKarma = Math.max(0, karma - (days * 5));
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      currentKarma += Math.floor(Math.random() * 10);
      data.push({
        date: date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        karma: Math.min(currentKarma, karma),
      });
    }
    
    return data;
  };

  const badges = getBadges();
  const karmaData = generateKarmaData();

  return (
    <div className="space-y-6">
      {/* Karma Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Karma Geçmişi (Son 30 Gün)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={karmaData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="currentColor"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="currentColor"
            />
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
      </Card>

      {/* Badges Section */}
      {badges.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Rozetler
          </h3>
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
        </Card>
      )}

      {/* Activity Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Aktivite Özeti</h3>
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
      </Card>
    </div>
  );
};

export default UserProfileEnhanced;
