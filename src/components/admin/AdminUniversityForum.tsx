import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Trash, Lock, Pin, Eye, Ban, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const AdminUniversityForum = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [bans, setBans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsRes, reportsRes, queueRes, bansRes] = await Promise.all([
        supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("reports")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        supabase
          .from("post_queue")
          .select("*, posts(*)")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        supabase
          .from("user_bans")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      setPosts(postsRes.data || []);
      setReports(reportsRes.data || []);
      setQueue(queueRes.data || []);
      setBans(bansRes.data || []);
    } catch (error) {
      console.error("Veri yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePostPin = async (postId: string, currentPin: boolean) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ is_pinned: !currentPin })
        .eq("id", postId);

      if (error) throw error;
      toast({ title: `Gönderi ${!currentPin ? "sabitlend i" : "sabitlemesi kaldırıldı"}` });
      loadData();
    } catch (error) {
      toast({ title: "Hata", variant: "destructive" });
    }
  };

  const togglePostLock = async (postId: string, currentLock: boolean) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ is_locked: !currentLock })
        .eq("id", postId);

      if (error) throw error;
      toast({ title: `Gönderi ${!currentLock ? "kilitlendi" : "kilidi açıldı"}` });
      loadData();
    } catch (error) {
      toast({ title: "Hata", variant: "destructive" });
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm("Bu gönderiyi silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("posts")
        .update({ is_deleted: true })
        .eq("id", postId);

      if (error) throw error;
      toast({ title: "Gönderi silindi" });
      loadData();
    } catch (error) {
      toast({ title: "Hata", variant: "destructive" });
    }
  };

  const approvePost = async (queueId: string, postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await Promise.all([
        supabase
          .from("post_queue")
          .update({
            status: "approved",
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", queueId),
        supabase
          .from("posts")
          .update({ is_approved: true })
          .eq("id", postId),
      ]);

      toast({ title: "Gönderi onaylandı" });
      loadData();
    } catch (error) {
      toast({ title: "Hata", variant: "destructive" });
    }
  };

  const rejectPost = async (queueId: string, postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await Promise.all([
        supabase
          .from("post_queue")
          .update({
            status: "rejected",
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", queueId),
        supabase
          .from("posts")
          .update({ is_deleted: true })
          .eq("id", postId),
      ]);

      toast({ title: "Gönderi reddedildi" });
      loadData();
    } catch (error) {
      toast({ title: "Hata", variant: "destructive" });
    }
  };

  const resolveReport = async (reportId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("reports")
        .update({
          status: "resolved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;
      toast({ title: "Şikayet çözüldü" });
      loadData();
    } catch (error) {
      toast({ title: "Hata", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Üniversite Forum Yönetimi</h1>
        <p className="text-muted-foreground">Gönderileri, şikayetleri ve yasakları yönetin</p>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Gönderiler ({posts.length})</TabsTrigger>
          <TabsTrigger value="queue">
            Onay Kuyruğu ({queue.length})
            {queue.length > 0 && (
              <Badge className="ml-2" variant="destructive">{queue.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports">
            Şikayetler ({reports.length})
            {reports.length > 0 && (
              <Badge className="ml-2" variant="destructive">{reports.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bans">Yasaklar ({bans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">Yükleniyor...</Card>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Henüz gönderi yok</p>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                      {post.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      {post.is_deleted && <Badge variant="destructive">Silindi</Badge>}
                      {post.is_shadowbanned && <Badge variant="outline">Gölge Ban</Badge>}
                      <h3 className="font-semibold">{post.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{post.author_username}</span>
                      <span>•</span>
                      <span>{post.upvotes - post.downvotes} puan</span>
                      <span>•</span>
                      <span>{post.comment_count} yorum</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => togglePostPin(post.id, post.is_pinned)}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => togglePostLock(post.id, post.is_locked)}
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          {queue.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Onay bekleyen gönderi yok</p>
            </Card>
          ) : (
            queue.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{item.flagged_by}</Badge>
                      <h3 className="font-semibold">{item.posts?.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.reason}
                    </p>
                    <p className="text-sm line-clamp-2">
                      {item.posts?.content}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => approvePost(item.id, item.post_id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Onayla
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => rejectPost(item.id, item.post_id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reddet
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Bekleyen şikayet yok</p>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{report.target_type}</Badge>
                      <h3 className="font-semibold">{report.reason}</h3>
                    </div>
                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {report.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(report.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </p>
                  </div>
                  <Button onClick={() => resolveReport(report.id)}>
                    Çözüldü
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="bans" className="space-y-4">
          {bans.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Yasak yok</p>
            </Card>
          ) : (
            bans.map((ban) => (
              <Card key={ban.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {ban.is_shadowban && <Badge variant="outline">Gölge Ban</Badge>}
                      {ban.is_permanent && <Badge variant="destructive">Kalıcı</Badge>}
                    </div>
                    <p className="text-sm font-semibold mb-1">
                      {ban.ip_address || "Kullanıcı ID: " + ban.user_id}
                    </p>
                    <p className="text-sm text-muted-foreground">{ban.reason}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUniversityForum;
