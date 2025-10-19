import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Wifi, WifiOff } from "lucide-react";

const KickLiveListener = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    checkIfLive();
    const interval = setInterval(checkIfLive, 60000); // Check every minute

    return () => {
      clearInterval(interval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    if (isLive && !isConnected) {
      connectWebSocket();
    } else if (!isLive && isConnected) {
      disconnectWebSocket();
    }
  }, [isLive]);

  const checkIfLive = async () => {
    try {
      const response = await fetch("https://kick.com/api/v2/channels/hadesost");
      const data = await response.json();
      setIsLive(data.livestream !== null);
    } catch (error) {
      console.error("Error checking live status:", error);
    }
  };

  const connectWebSocket = () => {
    try {
      const projectId = "txinupgxlqagjyshvxty";
      const wsUrl = `wss://${projectId}.supabase.co/functions/v1/kick-subscriber-listener`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("[Kick Listener] Connected to subscriber listener");
        setIsConnected(true);
        toast({
          title: "Canlı Yayın Dinleyicisi Aktif",
          description: "Yeni aboneler otomatik olarak eklenecek",
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "new_subscriber") {
            toast({
              title: "🎉 Yeni Abone!",
              description: `${data.subscriber.username} abone oldu!`,
            });
          } else if (data.type === "gifted_subs") {
            toast({
              title: "🎁 Hediye Abonelik!",
              description: `${data.gifter} ${data.count} abonelik hediye etti!`,
            });
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("[Kick Listener] WebSocket error:", error);
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log("[Kick Listener] Connection closed");
        setIsConnected(false);
        
        // Auto-reconnect if still live
        if (isLive) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("[Kick Listener] Attempting to reconnect...");
            connectWebSocket();
          }, 5000);
        }
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      setIsConnected(false);
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  };

  if (!isLive) {
    return null; // Don't show anything when not live
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge
        variant={isConnected ? "default" : "destructive"}
        className="flex items-center gap-2 px-4 py-2 text-sm"
      >
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 animate-pulse" />
            <span>Canlı Abone Dinleyicisi Aktif</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Bağlantı Kuruluyor...</span>
          </>
        )}
      </Badge>
    </div>
  );
};

export default KickLiveListener;
