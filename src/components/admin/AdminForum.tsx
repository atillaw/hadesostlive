import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Trash, Lock, Pin, Eye, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const AdminForum = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [bans, setBans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [topicsRes, reportsRes, bansRes] = await Promise.all([
        supabase
          .from("forum_topics")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("forum_reports")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        supabase
          .from("forum_bans")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);

      setTopics(topicsRes.data || []);
      setReports(reportsRes.data || []);
      setBans(bansRes.data || []);
    } catch (error) {
      console.error("Veri yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicLock = async (topicId: string, currentLock: boolean) => {
    try {
      const { error } = await supabase
        .from("forum_topics")
        .update({ is_locked: !currentLock })
        .eq("id", topicId);

      if (error) throw error;
      toast({ title: `Konu ${!currentLock ? "kilitlendi" : "kilidi açıldı"}` });
      loadData();
    } catch (error) {
      toast({ title: "Hata", variant: "destructive" });
    }
  };

  const toggleTopicPin = async (topicId: string, currentPin: boolean) => {
    try {
      const { error } = await supabase
        .from("forum_topics")
        .update({ is_pinned: !currentPin })
        .eq("id", topicId);

      if (error) throw error;
      toast({ title: `Konu ${!currentPin ? "sabitlend i" : "sabitlemesi kaldırıldı"}` });
      loadData();
    } catch (error) {
      toast({ title: "Hata", variant: "destructive" });
    }
  };

  const deleteTopic = async (topicId: string) => {
    if (!confirm("Bu konuyu silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("forum_topics")
        .update({ is_deleted: true })
        .eq("id", topicId);

      if (error) throw error;
      toast({ title: "Konu silindi" });
      loadData();
    } catch (error) {
      toast({ title: "Hata", variant: "destructive" });
    }
  };

  const resolveReport = async (reportId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("forum_reports")
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
        <h1 className="text-3xl font-bold mb-2">Forum Yönetimi</h1>
        <p className="text-muted-foreground">Konuları, şikayetleri ve yasakları yönetin</p>
      </div>

      <Tabs defaultValue="topics">
        <TabsList>
          <TabsTrigger value="topics">Konular ({topics.length})</TabsTrigger>
          <TabsTrigger value="reports">
            Şikayetler ({reports.length})
            {reports.length > 0 && (
              <Badge className="ml-2" variant="destructive">{reports.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bans">Yasaklar ({bans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">Yükleniyor...</Card>
          ) : topics.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Henüz konu yok</p>
            </Card>
          ) : (
            topics.map((topic) => (
              <Card key={topic.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {topic.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                      {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      {topic.is_deleted && <Badge variant="destructive">Silindi</Badge>}
                      <h3 className="font-semibold">{topic.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{topic.author_username}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{topic.entry_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{topic.view_count}</span>
                      </div>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(topic.created_at), {
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
                      onClick={() => toggleTopicPin(topic.id, topic.is_pinned)}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleTopicLock(topic.id, topic.is_locked)}
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteTopic(topic.id)}
                    >
                      <Trash className="h-4 w-4" />
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
                      <Badge>{report.report_type}</Badge>
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
                    Çözüldü Olarak İşaretle
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="bans" className="space-y-4">
          {bans.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Aktif yasak yok</p>
            </Card>
          ) : (
            bans.map((ban) => (
              <Card key={ban.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{ban.ip_address || "Kullanıcı"}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{ban.reason}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {ban.is_permanent ? (
                        <Badge variant="destructive">Kalıcı</Badge>
                      ) : (
                        <Badge>
                          {new Date(ban.expires_at).toLocaleDateString("tr-TR")} tarihine kadar
                        </Badge>
                      )}
                    </div>
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

export default AdminForum;
