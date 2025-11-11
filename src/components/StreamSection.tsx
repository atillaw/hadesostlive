import { Card } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ViewerStatsChart from "@/components/ViewerStatsChart";
import { supabase } from "@/integrations/supabase/client";

const StreamSection = () => {
  const [isLive, setIsLive] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const wasLiveRef = useRef(false);

  useEffect(() => {
    // Check notification permission on mount
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
    
    checkIfLive();
    const interval = setInterval(checkIfLive, 60000);
    return () => clearInterval(interval);
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === "granted") {
        toast({
          title: "✅ Bildirimler Aktif",
          description: "Yayın başladığında bildirim alacaksınız!",
        });
      }
    }
  };

  const sendLiveNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🔴 HadesOST Canlı Yayında!", {
        body: "Yayın şimdi başladı! Hemen katıl ve sohbete dahil ol.",
        icon: thumbnailUrl || undefined,
        tag: "live-stream",
      });
    }
    
    toast({
      title: "🔴 Canlı Yayın Başladı!",
      description: "HadesOST şimdi canlı yayında!",
      duration: 5000,
    });
  };

  const saveViewerCount = async (count: number) => {
    try {
      // Use service role or public insert with admin check
      await supabase.from("viewer_stats").insert({
        viewer_count: count,
        is_live: true
      });
    } catch (error) {
      console.error("Error saving viewer count:", error);
    }
  };

  const checkIfLive = async () => {
    try {
      const response = await fetch("https://kick.com/api/v2/channels/hadesost");
      const data = await response.json();
      const live = data.livestream !== null;
      
      // Check if stream just went live
      if (live && !wasLiveRef.current) {
        sendLiveNotification();
      }
      
      wasLiveRef.current = live;
      setIsLive(live);
      
      // Set viewer count if live and save to database
      if (data.livestream?.viewer_count !== undefined) {
        setViewerCount(data.livestream.viewer_count);
        
        // Save viewer count every check (every minute)
        if (live) {
          saveViewerCount(data.livestream.viewer_count);
        }
      } else {
        setViewerCount(null);
      }
      
      if (data.livestream?.thumbnail?.url) {
        setThumbnailUrl(data.livestream.thumbnail.url);
      } else if (data.user?.profile_pic) {
        setThumbnailUrl(data.user.profile_pic);
      }
    } catch (error) {
      console.error("Error checking live status:", error);
    }
  };

  return (
    <section className="py-16 md:py-24 container mx-auto px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">
            Live Stream
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Canlı yayını izle, sohbete katıl ve topluluğun bir parçası ol!
          </p>
        </div>
        
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr,400px] gap-6 animate-slide-up items-start">
          {/* Stream Player */}
          <div className="overflow-hidden rounded-lg border border-primary/30 card-glow bg-card/50 backdrop-blur-sm flex flex-col w-full">
            <div className="aspect-video relative bg-black">
              {isLive ? (
                <iframe
                  src="https://player.kick.com/hadesost"
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  scrolling="no"
                  allowFullScreen={true}
                  title="HadesOST Live Stream"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/90 to-background/70">
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt="Stream Thumbnail" 
                      className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
                    />
                  ) : null}
                  <div className="relative z-10 text-center space-y-4 px-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                      <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Yayın Çevrimdışı</h3>
                      <p className="text-muted-foreground text-sm mb-4">Şu anda canlı yayın yok. Eski yayınları izlemek için arşivi ziyaret et!</p>
                      <Button 
                        onClick={() => window.location.href = '/vods'}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        VOD Arşivini İzle
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-card/80 backdrop-blur border-t border-border/50">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {isLive ? (
                    <>
                      <Badge variant="default" className="bg-secondary text-secondary-foreground animate-pulse px-3 py-1">
                        <div className="w-2 h-2 bg-secondary-foreground rounded-full mr-2 animate-pulse" />
                        CANLI
                      </Badge>
                      {viewerCount !== null && (
                        <Badge variant="outline" className="px-3 py-1 border-primary/30">
                          <svg className="w-4 h-4 mr-1.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {viewerCount.toLocaleString()} İzleyici
                        </Badge>
                      )}
                    </>
                  ) : (
                    <Badge variant="secondary" className="px-3 py-1 opacity-70">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full mr-2" />
                      OFFLİNE
                    </Badge>
                  )}
                  
                  {notificationPermission !== "granted" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={requestNotificationPermission}
                      className="text-xs"
                    >
                      🔔 Bildirimleri Aç
                    </Button>
                  )}
                </div>
                <a 
                  href="https://kick.com/hadesost" 
                  className="text-sm text-primary hover:text-primary-glow transition-colors font-medium flex items-center gap-2 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kick'te Aç
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Viewer Stats Chart - Only show when live and has viewer count */}
          {isLive && viewerCount !== null && (
            <div className="w-full lg:col-span-2 mt-6">
              <ViewerStatsChart />
            </div>
          )}
          
          {/* Chat */}
          <Card className="overflow-hidden border-primary/30 card-glow bg-card/50 backdrop-blur-sm lg:h-[720px] h-[500px] flex flex-col shrink-0 w-full lg:w-auto">
            <div className="p-4 bg-card/80 backdrop-blur border-b border-border/50">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Canlı Sohbet
              </h3>
            </div>
            <div className="flex-1 relative">
              <iframe
                src="https://kick.com/popout/hadesost/chat"
                className="w-full h-full border-0"
                allowFullScreen
                title="HadesOST Chat"
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StreamSection;
