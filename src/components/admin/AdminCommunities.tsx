import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AdminCommunities = () => {
  const [communities, setCommunities] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    slug: "",
    description: "",
    description_long: "",
    icon_url: "",
    theme_color: "#FF4500",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [communitiesRes, postsRes, reportsRes] = await Promise.all([
      supabase.from("communities").select("*").order("created_at", { ascending: false }),
      supabase
        .from("posts")
        .select("*, community:communities(name, slug)")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("reports")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

    if (communitiesRes.data) setCommunities(communitiesRes.data);
    if (postsRes.data) setPosts(postsRes.data);
    if (reportsRes.data) setReports(reportsRes.data);
    setLoading(false);
  };

  const handleCreateCommunity = async () => {
    const { error } = await supabase.from("communities").insert([newCommunity]);

    if (error) {
      toast.error("Topluluk oluşturulamadı");
      return;
    }

    toast.success("Topluluk oluşturuldu");
    setNewCommunity({
      name: "",
      slug: "",
      description: "",
      description_long: "",
      icon_url: "",
      theme_color: "#FF4500",
    });
    loadData();
  };

  const toggleCommunityStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("communities")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Durum değiştirilemedi");
      return;
    }

    toast.success("Topluluk durumu güncellendi");
    loadData();
  };

  const deleteCommunity = async (id: string) => {
    if (!confirm("Bu topluluğu silmek istediğinizden emin misiniz?")) return;

    const { error } = await supabase.from("communities").delete().eq("id", id);

    if (error) {
      toast.error("Topluluk silinemedi");
      return;
    }

    toast.success("Topluluk silindi");
    loadData();
  };

  const approvePost = async (id: string) => {
    const { error } = await supabase
      .from("posts")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      toast.error("Gönderi onaylanamadı");
      return;
    }

    toast.success("Gönderi onaylandı");
    loadData();
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase
      .from("posts")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) {
      toast.error("Gönderi silinemedi");
      return;
    }

    toast.success("Gönderi silindi");
    loadData();
  };

  const resolveReport = async (id: string, action: "approve" | "delete") => {
    const report = reports.find((r) => r.id === id);
    if (!report) return;

    if (action === "delete") {
      await deletePost(report.target_id);
    }

    const { error } = await supabase
      .from("reports")
      .update({ status: "resolved" })
      .eq("id", id);

    if (error) {
      toast.error("Rapor çözümlenemedi");
      return;
    }

    toast.success("Rapor çözümlendi");
    loadData();
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="communities" className="w-full">
        <TabsList>
          <TabsTrigger value="communities">Topluluklar</TabsTrigger>
          <TabsTrigger value="posts">Gönderiler</TabsTrigger>
          <TabsTrigger value="reports">
            Raporlar
            {reports.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {reports.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="communities">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Topluluk Yönetimi</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Topluluk
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Topluluk Oluştur</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>İsim</Label>
                      <Input
                        value={newCommunity.name}
                        onChange={(e) =>
                          setNewCommunity({ ...newCommunity, name: e.target.value })
                        }
                        placeholder="Teknoloji"
                      />
                    </div>
                    <div>
                      <Label>Slug (URL)</Label>
                      <Input
                        value={newCommunity.slug}
                        onChange={(e) =>
                          setNewCommunity({ ...newCommunity, slug: e.target.value })
                        }
                        placeholder="teknoloji"
                      />
                    </div>
                    <div>
                      <Label>Kısa Açıklama</Label>
                      <Input
                        value={newCommunity.description}
                        onChange={(e) =>
                          setNewCommunity({
                            ...newCommunity,
                            description: e.target.value,
                          })
                        }
                        placeholder="Teknoloji haberleri ve tartışmaları"
                      />
                    </div>
                    <div>
                      <Label>Detaylı Açıklama</Label>
                      <Textarea
                        value={newCommunity.description_long}
                        onChange={(e) =>
                          setNewCommunity({
                            ...newCommunity,
                            description_long: e.target.value,
                          })
                        }
                        placeholder="Uzun açıklama..."
                      />
                    </div>
                    <div>
                      <Label>İkon (Emoji)</Label>
                      <Input
                        value={newCommunity.icon_url}
                        onChange={(e) =>
                          setNewCommunity({
                            ...newCommunity,
                            icon_url: e.target.value,
                          })
                        }
                        placeholder="💻"
                      />
                    </div>
                    <div>
                      <Label>Tema Rengi</Label>
                      <Input
                        type="color"
                        value={newCommunity.theme_color}
                        onChange={(e) =>
                          setNewCommunity({
                            ...newCommunity,
                            theme_color: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button onClick={handleCreateCommunity} className="w-full">
                      Oluştur
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İsim</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Üyeler</TableHead>
                  <TableHead>Gönderiler</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communities.map((community) => (
                  <TableRow key={community.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{community.icon_url}</span>
                        {community.name}
                      </div>
                    </TableCell>
                    <TableCell>c/{community.slug}</TableCell>
                    <TableCell>{community.member_count}</TableCell>
                    <TableCell>{community.post_count}</TableCell>
                    <TableCell>
                      <Badge variant={community.is_active ? "default" : "secondary"}>
                        {community.is_active ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toggleCommunityStatus(community.id, community.is_active)
                          }
                        >
                          {community.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCommunity(community.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Gönderi Yönetimi</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Topluluk</TableHead>
                  <TableHead>Yazar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      {post.community ? `c/${post.community.slug}` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {post.is_anonymous ? "Anonim" : post.author_username}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          post.is_approved
                            ? "default"
                            : post.is_deleted
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {post.is_deleted
                          ? "Silindi"
                          : post.is_approved
                          ? "Onaylı"
                          : "Bekliyor"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!post.is_approved && (
                          <Button
                            size="sm"
                            onClick={() => approvePost(post.id)}
                          >
                            Onayla
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePost(post.id)}
                        >
                          Sil
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Rapor Yönetimi</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sebep</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Rapor Eden</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.reason}</TableCell>
                    <TableCell>{report.description || "-"}</TableCell>
                    <TableCell>
                      {report.reporter_identifier || "Anonim"}
                    </TableCell>
                    <TableCell>
                      {new Date(report.created_at).toLocaleDateString("tr-TR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => resolveReport(report.id, "approve")}
                        >
                          Koru
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => resolveReport(report.id, "delete")}
                        >
                          Sil
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCommunities;
