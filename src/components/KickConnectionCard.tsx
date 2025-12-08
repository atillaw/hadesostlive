import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link as LinkIcon, ExternalLink, Check, RefreshCw, AlertCircle, Loader2, MessageSquare, Crown, Shield, Star, Zap } from "lucide-react";
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
  verified_via?: string;
  is_follower?: boolean;
  followed_at?: string;
  is_subscriber?: boolean;
  subscription_tier?: string;
  subscribed_at?: string;
  subscription_months?: number;
  is_moderator?: boolean;
  is_vip?: boolean;
  is_og?: boolean;
  is_founder?: boolean;
  badges?: Array<{ type: string; text: string }>;
  last_synced_at?: string;
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
  const [verifying, setVerifying] = useState(false);
  const [kickAccount, setKickAccount] = useState<KickAccount | null>(null);
  const [subscriberInfo, setSubscriberInfo] = useState<any>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [connectionMethod, setConnectionMethod] = useState<"oauth" | "bot">("bot");

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

  const handleVerifyToken = async () => {
    if (!tokenInput.trim()) {
      toast({
        title: "Token gerekli",
        description: "Lütfen Kick chatinden aldığınız tokeni girin",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Giriş yapmalısınız",
          description: "Token doğrulamak için giriş yapmalısınız",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("kick-verify-token", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { token: tokenInput.trim() },
      });

      if (response.error) {
        throw new Error(response.error.message || "Token doğrulanamadı");
      }

      if (response.data?.success) {
        toast({
          title: "Başarılı!",
          description: response.data.message || "Kick hesabınız başarıyla bağlandı!",
        });
        setTokenInput("");
        await loadKickAccount();
        onConnectionChange?.();
      } else {
        throw new Error(response.data?.error || "Token doğrulanamadı");
      }
    } catch (error: any) {
      toast({
        title: "Doğrulama Hatası",
        description: error.message || "Token doğrulanırken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
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
    if (kickAccount?.subscription_months) return kickAccount.subscription_months;
    if (!subscriberInfo) return 0;
    const now = new Date();
    const subscribedDate = new Date(subscriberInfo.subscribed_at);
    const months = Math.floor((now.getTime() - subscribedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return Math.max(1, months);
  };

  const renderBadges = () => {
    if (!kickAccount) return null;
    
    const badges = [];
    
    if (kickAccount.is_subscriber) {
      badges.push(
        <Badge key="sub" className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Crown className="w-3 h-3 mr-1" />
          {kickAccount.subscription_tier || "Abone"}
        </Badge>
      );
    }
    
    if (kickAccount.is_moderator) {
      badges.push(
        <Badge key="mod" className="bg-gradient-to-r from-green-500 to-emerald-500">
          <Shield className="w-3 h-3 mr-1" />
          Moderatör
        </Badge>
      );
    }
    
    if (kickAccount.is_vip) {
      badges.push(
        <Badge key="vip" className="bg-gradient-to-r from-yellow-500 to-orange-500">
          <Star className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      );
    }
    
    if (kickAccount.is_og) {
      badges.push(
        <Badge key="og" className="bg-gradient-to-r from-blue-500 to-cyan-500">
          <Zap className="w-3 h-3 mr-1" />
          OG
        </Badge>
      );
    }
    
    if (kickAccount.is_founder) {
      badges.push(
        <Badge key="founder" className="bg-gradient-to-r from-red-500 to-rose-500">
          <Star className="w-3 h-3 mr-1" />
          Founder
        </Badge>
      );
    }
    
    if (kickAccount.is_follower) {
      badges.push(
        <Badge key="follower" variant="secondary">
          Takipçi
        </Badge>
      );
    }
    
    return badges.length > 0 ? (
      <div className="flex flex-wrap gap-1 mt-2">
        {badges}
      </div>
    ) : null;
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
          <div className="space-y-4">
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

            <Tabs value={connectionMethod} onValueChange={(v) => setConnectionMethod(v as "oauth" | "bot")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bot" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Chat Komutu
                </TabsTrigger>
                <TabsTrigger value="oauth" className="flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" />
                  OAuth
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="bot" className="space-y-4 mt-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm">Nasıl Bağlanılır?</h4>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>
                      <a 
                        href="https://kick.com/hadesost" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        kick.com/hadesost
                      </a>{" "}
                      kanalına gidin
                    </li>
                    <li>Chat'e <code className="bg-background px-1.5 py-0.5 rounded text-primary font-mono">!connect</code> yazın</li>
                    <li>Bot size özel bir kod verecek</li>
                    <li>O kodu aşağıya girin</li>
                  </ol>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Token kodu (örn: ABC12XYZ)"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                    className="font-mono tracking-wider"
                    maxLength={8}
                  />
                  <Button 
                    onClick={handleVerifyToken}
                    disabled={verifying || !tokenInput.trim()}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {verifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Doğrula
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="oauth" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Kick'in resmi OAuth sistemiyle hesabınızı bağlayın. Kick sayfasına yönlendirileceksiniz.
                </p>
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
                      Kick ile Bağlan
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
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
                  {kickAccount.verified_via === "bot" && (
                    <Badge variant="outline" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Bot
                    </Badge>
                  )}
                </div>
                <a 
                  href={`https://kick.com/${kickAccount.kick_channel_slug || kickAccount.kick_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  kick.com/{kickAccount.kick_channel_slug || kickAccount.kick_username}
                </a>
                {renderBadges()}
                {kickAccount.is_subscriber && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {getSubscriptionMonths()} aydır abone
                  </p>
                )}
              </div>
            </div>

            {kickAccount.is_token_expired && kickAccount.verified_via !== "bot" && (
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

            {kickAccount.last_synced_at && (
              <p className="text-xs text-muted-foreground">
                Son senkronizasyon: {new Date(kickAccount.last_synced_at).toLocaleString('tr-TR')}
              </p>
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
