import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Trash2, CheckCircle, XCircle } from "lucide-react";

interface Report {
  id: string;
  target_id: string;
  target_type: string;
  reason: string;
  description: string | null;
  status: string;
  reporter_id: string | null;
  reporter_identifier: string | null;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

const AdminReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [targetDetails, setTargetDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    
    let query = supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Raporlar yüklenemedi");
      setLoading(false);
      return;
    }

    setReports(data || []);
    
    // Load target details (posts/comments)
    const details: Record<string, any> = {};
    for (const report of data || []) {
      if (report.target_type === "post") {
        const { data: post } = await supabase
          .from("posts")
          .select("title, author_username")
          .eq("id", report.target_id)
          .single();
        if (post) details[report.target_id] = post;
      } else if (report.target_type === "comment") {
        const { data: comment } = await supabase
          .from("comments")
          .select("content, author_username")
          .eq("id", report.target_id)
          .single();
        if (comment) details[report.target_id] = comment;
      }
    }
    
    setTargetDetails(details);
    setLoading(false);
  };

  const handleReportAction = async (
    reportId: string,
    targetId: string,
    targetType: string,
    action: "approve" | "delete"
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (action === "delete") {
      // Delete the reported content
      if (targetType === "post") {
        const { error } = await supabase
          .from("posts")
          .update({ is_deleted: true })
          .eq("id", targetId);
        
        if (error) {
          toast.error("Gönderi silinemedi");
          return;
        }
      } else if (targetType === "comment") {
        const { error } = await supabase
          .from("comments")
          .update({ is_deleted: true })
          .eq("id", targetId);
        
        if (error) {
          toast.error("Yorum silinemedi");
          return;
        }
      }
    }

    // Update report status
    const { error } = await supabase
      .from("reports")
      .update({
        status: action === "delete" ? "resolved" : "dismissed",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (error) {
      toast.error("Rapor güncellenemedi");
      return;
    }

    toast.success(
      action === "delete"
        ? "İçerik silindi ve rapor çözümlendi"
        : "Rapor reddedildi"
    );
    loadReports();
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: "Spam veya gereksiz içerik",
      harassment: "Hakaret veya taciz",
      inappropriate: "Uygunsuz içerik",
      misinformation: "Yanlış bilgi",
      violence: "Şiddet veya tehdit",
      other: "Diğer",
    };
    return labels[reason] || reason;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "resolved":
        return "success";
      case "dismissed":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Yükleniyor...</div>;
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Rapor Moderasyonu</h2>
        <div className="flex gap-4 items-center">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="pending">Bekleyen</SelectItem>
              <SelectItem value="resolved">Çözümlenmiş</SelectItem>
              <SelectItem value="dismissed">Reddedilmiş</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline">
            {reports.length} rapor
          </Badge>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          Görüntülenecek rapor yok
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tür</TableHead>
              <TableHead>Hedef İçerik</TableHead>
              <TableHead>Sebep</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Rapor Eden</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => {
              const target = targetDetails[report.target_id];
              return (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {report.target_type === "post" ? "Gönderi" : "Yorum"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {target?.title || target?.content || "Yükleniyor..."}
                    </div>
                    {target && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Yazar: {target.author_username}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge>{getReasonLabel(report.reason)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {report.description || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {report.reporter_identifier || "Anonim"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(report.status) as any}>
                      {report.status === "pending"
                        ? "Bekliyor"
                        : report.status === "resolved"
                        ? "Çözümlendi"
                        : "Reddedildi"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(report.created_at).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    {report.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleReportAction(
                              report.id,
                              report.target_id,
                              report.target_type,
                              "approve"
                            )
                          }
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reddet
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleReportAction(
                              report.id,
                              report.target_id,
                              report.target_type,
                              "delete"
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          İçeriği Sil
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};

export default AdminReports;
