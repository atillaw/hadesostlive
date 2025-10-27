import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  details: any;
  created_at: string;
  profiles?: {
    username: string;
  };
}

const AdminLogs = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('admin_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_logs'
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch usernames separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(log => log.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || []);
        const logsWithProfiles = data.map(log => ({
          ...log,
          profiles: { username: profileMap.get(log.user_id) || 'Bilinmeyen' }
        }));
        setLogs(logsWithProfiles);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      approve: "bg-green-500",
      reject: "bg-red-500",
      delete: "bg-destructive",
      update: "bg-blue-500",
      create: "bg-primary",
    };

    return (
      <Badge className={colors[action] || "bg-muted"}>
        {action.toUpperCase()}
      </Badge>
    );
  };

  const getTableLabel = (tableName: string) => {
    const labels: Record<string, string> = {
      clips: "Klipler",
      meme_uploads: "Memeler",
      vods: "VOD'lar",
      content_ideas: "İçerik Fikirleri",
      support_chats: "Destek Sohbetleri",
    };
    return labels[tableName] || tableName;
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Admin İşlem Logları</h2>
        <p className="text-sm text-muted-foreground">
          Tüm admin işlemlerinin kaydı (Son 100 işlem)
        </p>
      </div>

      {logs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Henüz işlem kaydı yok.</p>
      ) : (
        <ScrollArea className="h-[600px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih/Saat</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>İşlem</TableHead>
                <TableHead>Tablo</TableHead>
                <TableHead>Detaylar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {new Date(log.created_at).toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.profiles?.username || 'Bilinmeyen'}
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>{getTableLabel(log.table_name)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    {log.details && (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </code>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
};

export default AdminLogs;