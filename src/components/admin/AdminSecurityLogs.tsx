import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, Info, Activity } from "lucide-react";

interface SecurityLog {
  id: string;
  event_type: string;
  severity: string;
  ip_address: string;
  user_agent: string;
  endpoint: string;
  details: any;
  created_at: string;
}

const AdminSecurityLogs = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();

    const channel = supabase
      .channel("security-logs-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "security_logs" },
        () => loadLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("security_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error loading security logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      critical: { variant: "destructive", icon: AlertTriangle },
      warning: { variant: "default", icon: Shield },
      info: { variant: "secondary", icon: Info },
    };

    const config = variants[severity] || variants.info;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {severity.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">Yükleniyor...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Güvenlik Logları</h2>
        <Badge variant="outline">{logs.length} kayıt</Badge>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(log.severity)}
                  <span className="font-medium">{log.event_type}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString("tr-TR")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div>
                  <span className="text-muted-foreground">IP: </span>
                  <span className="font-mono">{log.ip_address}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Endpoint: </span>
                  <span className="font-mono">{log.endpoint}</span>
                </div>
              </div>

              {log.details && Object.keys(log.details).length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    Detaylar
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default AdminSecurityLogs;
