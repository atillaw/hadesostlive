import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link as LinkIcon, ExternalLink, Check, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface KickAccount {
  id: string;
  kick_user_id: string;
  kick_username: string;
  kick_channel_slug?: string;
  kick_display_name?: string;
  kick_avatar_url?: string;
  access_token_expires_at: string;
  created_at: string;
  is_token_expired?: boolean;
}

interface KickConnectionCardProps {
  hasError?: boolean;
  onConnectionChange?: () => void;
}

export const KickConnectionCard = ({ hasError, onConnectionChange }: KickConnectionCardProps) => {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [kickAccount, setKickAccount] = useState<KickAccount | null>(null);
  const [subscriberInfo, setSubscriberInfo] = useState<any>(null);

  useEffect(() => {
    loadKickAccount();
  }, []);

  const loadKickAccount = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const response = await supabase.functions.invoke("kick-get-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.data?.connected && response.data?.account) {
        setKickAccount(response.data.account);
        // Load subscriber info
        await loadSubscriberInfo(response.data.account.kick_username);
      } else {
        setKickAccount(null);
      }
    } catch (error) {
      console.error("Failed to load Kick account:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriberInfo = async (kickUsername: string) => {
    const { data } = await supabase
      .from("kick_subscribers")
      .select("*")
      .eq("username", kickUsername)
      .order("subscribed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setSubscriberInfo(data);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Giriş yapmalısınız",
          description: "Kick hesabını bağlamak için giriş yapmalısınız",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("kick-oauth-login", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) {
        throw new Error(response.error.message || "OAuth başlatılamadı");
      }

      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error("Yetkilendirme URL'si alınamadı");
      }
    } catch (error: any) {
      console.error("Connect error:", error);
      toast({
        title: "Bağlantı Hatası",
        description: error.message || "Kick hesabı bağlanırken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke("kick-disconnect", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) {
        throw new Error(response.error.message || "Bağlantı kesilemedi");
      }

      setKickAccount(null);
      setSubscriberInfo(null);
      toast({
        title: "Bağlantı kesildi",
        description: "Kick hesabınızın bağlantısı başarıyla kesildi",
      });
      onConnectionChange?.();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Bağlantı kesilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleRefreshToken = async () => {
    setRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke("kick-refresh-token", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) {
        throw new Error(response.error.message || "Token yenilenemedi");
      }

      toast({
        title: "Token yenilendi",
        description: "Kick erişim tokenınız başarıyla yenilendi",
      });
      await loadKickAccount();
    } catch (error: any) {
      toast({
        title: "Token Yenileme Hatası",
        description: error.message || "Token yenilenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getSubscriptionMonths = () => {
    if (!subscriberInfo) return 0;
    const now = new Date();
    const subscribedDate = new Date(subscriberInfo.subscribed_at);
    const months = Math.floor((now.getTime() - subscribedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return Math.max(1, months);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Kick Hesabı Bağlantısı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-primary" />
          Kick Hesabı Bağlantısı
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!kickAccount ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Kick hesabınızı bağlayarak HadesOST kanalına abonelik durumunuzu gösterin ve özel rozetler kazanın.
            </p>
            {hasError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive font-medium">
                  Bağlantı başarısız oldu. Lütfen tekrar deneyin.
                </p>
              </div>
            )}
            <Button 
              onClick={handleConnect} 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bağlanıyor...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Kick Hesabını Bağla
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <Avatar className="h-16 w-16 border-2 border-green-500">
                <AvatarImage src={kickAccount.kick_avatar_url || undefined} />
                <AvatarFallback className="bg-green-500/20 text-green-500 text-lg font-bold">
                  {kickAccount.kick_username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-bold text-lg">{kickAccount.kick_display_name || kickAccount.kick_username}</span>
                </div>
                <a 
                  href={`https://kick.com/${kickAccount.kick_channel_slug || kickAccount.kick_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  kick.com/{kickAccount.kick_channel_slug || kickAccount.kick_username}
                </a>
                {subscriberInfo && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                      {subscriberInfo.subscription_tier} Abone
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getSubscriptionMonths()} aydır
                    </span>
                  </div>
                )}
              </div>
            </div>

            {kickAccount.is_token_expired && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <p className="text-sm text-amber-500">Token süresi dolmuş</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshToken}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Yenile
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Bağlantı: {new Date(kickAccount.created_at).toLocaleDateString('tr-TR')}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="text-destructive hover:text-destructive"
              >
                {disconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Bağlantıyı Kes"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KickConnectionCard;
