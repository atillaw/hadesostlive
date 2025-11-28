import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Moderator {
  id: string;
  user_id: string;
  community_id: string;
  permissions: any;
  profiles: {
    username: string;
  };
  communities: {
    name: string;
    slug: string;
  };
}

interface Community {
  id: string;
  name: string;
  slug: string;
}

const AdminCommunityModerators = () => {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadModerators();
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    const { data } = await supabase
      .from("communities")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name");

    if (data) setCommunities(data);
  };

  const loadModerators = async () => {
    const { data } = await supabase
      .from("community_moderators")
      .select(`
        *,
        profiles(username),
        communities(name, slug)
      `)
      .order("created_at", { ascending: false });

    if (data) setModerators(data as any);
  };

  const addModerator = async () => {
    if (!username.trim() || !selectedCommunity) {
      toast({
        title: "Hata",
        description: "Kullanıcı adı ve topluluk seçimi gerekli",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Find user by username
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (!profile) {
      toast({
        title: "Hata",
        description: "Kullanıcı bulunamadı",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("community_moderators").insert({
      user_id: profile.id,
      community_id: selectedCommunity,
      assigned_by: user?.id,
      permissions: {
        can_approve: true,
        can_pin: true,
        can_lock: true,
        can_ban: true,
      },
    });

    if (error) {
      toast({
        title: "Hata",
        description: "Moderatör eklenemedi: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Moderatör eklendi" });
      setUsername("");
      setSelectedCommunity("");
      loadModerators();
    }

    setLoading(false);
  };

  const removeModerator = async (id: string) => {
    const { error } = await supabase
      .from("community_moderators")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Hata",
        description: "Moderatör silinemedi",
        variant: "destructive",
      });
    } else {
      toast({ title: "Moderatör kaldırıldı" });
      loadModerators();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Topluluk Moderatörleri</h2>
        <p className="text-muted-foreground">
          Her topluluğa özel moderatörler atayın ve yönetin
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Yeni Moderatör Ekle
        </h3>
        <div className="flex gap-3">
          <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Topluluk seç" />
            </SelectTrigger>
            <SelectContent>
              {communities.map((community) => (
                <SelectItem key={community.id} value={community.id}>
                  c/{community.slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Kullanıcı adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addModerator} disabled={loading}>
            <UserPlus className="h-4 w-4 mr-2" />
            Ekle
          </Button>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kullanıcı</TableHead>
              <TableHead>Topluluk</TableHead>
              <TableHead>İzinler</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {moderators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Henüz moderatör yok
                </TableCell>
              </TableRow>
            ) : (
              moderators.map((mod) => (
                <TableRow key={mod.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    u/{mod.profiles.username}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">c/{mod.communities.slug}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {mod.permissions.can_approve && (
                        <Badge variant="outline">Onaylama</Badge>
                      )}
                      {mod.permissions.can_pin && (
                        <Badge variant="outline">Sabitleme</Badge>
                      )}
                      {mod.permissions.can_lock && (
                        <Badge variant="outline">Kilitleme</Badge>
                      )}
                      {mod.permissions.can_ban && (
                        <Badge variant="outline">Yasaklama</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeModerator(mod.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminCommunityModerators;
