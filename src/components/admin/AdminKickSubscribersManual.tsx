import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminKickSubscribersManual = () => {
  const [username, setUsername] = useState("");
  const [tier, setTier] = useState<string>("Tier 1");
  const [subType, setSubType] = useState<string>("normal");
  const [followerSince, setFollowerSince] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen kullanıcı adı girin.",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);

    try {
      const { error } = await supabase
        .from("kick_subscribers")
        .insert({
          username: username.trim(),
          subscription_tier: tier,
          subscription_type: subType,
          subscribed_at: new Date().toISOString(),
          follower_since: followerSince ? new Date(followerSince).toISOString() : null,
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `${username} abone olarak eklendi.`,
      });

      setUsername("");
      setTier("Tier 1");
      setSubType("normal");
      setFollowerSince("");
    } catch (error: any) {
      console.error("Error adding subscriber:", error);
      toast({
        title: "Hata",
        description: error.message || "Abone eklenemedi.",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <UserPlus className="h-6 w-6" />
        Manuel Abone Ekle
      </h2>

      <form onSubmit={handleAddSubscriber} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Kullanıcı Adı</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="kickusername"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tier">Tier</Label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tier 1">Tier 1</SelectItem>
              <SelectItem value="Tier 2">Tier 2</SelectItem>
              <SelectItem value="Tier 3">Tier 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtype">Abonelik Tipi</Label>
          <Select value={subType} onValueChange={setSubType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="gifted">Hediye</SelectItem>
              <SelectItem value="renewed">Yenilenen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="followerSince">Takibe Başlama Tarihi (Opsiyonel)</Label>
          <Input
            id="followerSince"
            type="datetime-local"
            value={followerSince}
            onChange={(e) => setFollowerSince(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={adding} className="w-full">
          {adding ? "Ekleniyor..." : "Abone Ekle"}
        </Button>
      </form>
    </Card>
  );
};

export default AdminKickSubscribersManual;
