import { Card } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ViewerStatsChart from "@/components/ViewerStatsChart";
import ViewerStatsDetailed from "@/components/ViewerStatsDetailed";
import LeaderboardWidget from "./LeaderboardWidget";
import GlobalMiniGamesLeaderboard from "./GlobalMiniGamesLeaderboard";
import AchievementsBadge from "./AchievementsBadge";
import PredictionGame from "@/components/PredictionGame";
import MiniGameWidget from "@/components/MiniGameWidget";
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
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 glow-text bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Live Stream
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Canlı yayını izle, sohbete katıl ve topluluğun bir parçası ol!
          </p>
        </div>
        
        {/* Stream Player ve Chat - Yan Yana */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 mb-8 animate-slide-up">
          {/* Stream Player */}
          <Card className="overflow-hidden bg-card/50 backdrop-blur border-primary/20 shadow-2xl">
            <div className="aspect-video relative bg-gradient-to-br from-background via-background/95 to-background/90">
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
                <div className="absolute inset-0 flex items-center justify-center">
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt="Stream Thumbnail" 
                      className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md scale-110"
                    />
                  ) : null}
                  <div className="relative z-10 text-center space-y-6 px-6">
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-muted/20 flex items-center justify-center backdrop-blur-sm border border-border/50">
                      <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold">Yayın Çevrimdışı</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">Şu anda canlı yayın yok. Eski yayınları izlemek için arşivi ziyaret et!</p>
                      <Button 
                        onClick={() => window.location.href = '/vodlar'}
                        size="lg"
                        className="mt-4"
                      >
                        VOD Arşivini İzle
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 bg-card/90 backdrop-blur-lg border-t border-border/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {isLive ? (
                    <>
                      <Badge className="bg-red-600 hover:bg-red-600 text-white px-3 py-1 font-semibold shadow-lg animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block animate-ping"></span>
                        CANLI
                      </Badge>
                      {viewerCount !== null && (
                        <Badge variant="secondary" className="px-3 py-1 font-medium backdrop-blur-sm">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {viewerCount.toLocaleString()} izleyici
                        </Badge>
                      )}
                    </>
                  ) : (
                    <Badge variant="secondary" className="px-3 py-1 font-medium backdrop-blur-sm">
                      Çevrimdışı
                    </Badge>
                  )}
                </div>
                
                {notificationPermission !== "granted" && (
                  <Button 
                    onClick={requestNotificationPermission}
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Bildirimleri Aç
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Chat */}
          <Card className="h-full bg-card/50 backdrop-blur border-border/50 overflow-hidden">
            <div className="h-[600px] lg:h-full min-h-[600px]">
              <iframe
                src="https://kick.com/popout/hadesost/chat"
                className="w-full h-full"
                frameBorder="0"
                title="Kick Chat"
              />
            </div>
          </Card>
        </div>

        {/* İnteraktif Widgetlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <PredictionGame />
          <MiniGameWidget />
          <LeaderboardWidget />
          <GlobalMiniGamesLeaderboard />
        </div>
        
        {/* Başarımlar */}
        <div className="mb-8">
          <AchievementsBadge />
        </div>

        {/* Detaylı İstatistikler - Altta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="text-xl font-bold mb-4 glow-text">
              Anlık İstatistikler
            </h3>
            <ViewerStatsDetailed />
          </Card>
          
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <h3 className="text-xl font-bold mb-4 glow-text">
              İzleyici Grafiği
            </h3>
            <ViewerStatsChart />
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StreamSection;
