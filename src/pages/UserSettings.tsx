import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, Mail, Palette, Eye, User, Link as LinkIcon, ExternalLink, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/AvatarUpload";

const UserSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showNsfw, setShowNsfw] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  
  // Kick connection state
  const [kickUsername, setKickUsername] = useState<string | null>(null);
  const [kickConnectedAt, setKickConnectedAt] = useState<string | null>(null);
  const [subscriberInfo, setSubscriberInfo] = useState<any>(null);

  useEffect(() => {
    loadUser();
    
    // Check if returning from Kick OAuth
    if (searchParams.get("kick_connected") === "success") {
      toast({
        title: "Kick hesabı bağlandı!",
        description: "Kick hesabınız başarıyla bağlandı.",
      });
      // Remove query param
      window.history.replaceState({}, "", "/kullanici-ayarlari");
    }
  }, [searchParams]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Giriş gerekli",
        description: "Ayarlara erişmek için giriş yapmalısınız",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setUserId(user.id);
    
    // Load profile with Kick info
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, kick_username, kick_connected_at")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      setUsername(profile.username);
      setKickUsername(profile.kick_username);
      setKickConnectedAt(profile.kick_connected_at);
      
      // Load subscriber info if Kick is connected
      if (profile.kick_username) {
        loadSubscriberInfo(profile.kick_username);
      }
    }
    
    await loadPreferences(user.id);
  };

  const loadPreferences = async (uid: string) => {
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();

    if (prefs) {
      setEmailNotifications(prefs.email_notifications ?? true);
      setShowNsfw(prefs.show_nsfw ?? false);
    }

    // Load profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, bio")
      .eq("id", uid)
      .single();

    if (profile) {
      setAvatarUrl(profile.avatar_url);
      setBio(profile.bio || "");
    }
    
    setLoading(false);
  };

  const loadSubscriberInfo = async (kickUser: string) => {
    const { data } = await supabase
      .from("kick_subscribers")
      .select("*")
      .eq("username", kickUser)
      .order("subscribed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      setSubscriberInfo(data);
    }
  };

  const handleConnectKick = () => {
    if (!userId) return;
    
    const clientId = import.meta.env.VITE_SUPABASE_PROJECT_ID; // We'll use project ID as placeholder
    const redirectUri = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kick-oauth-callback`;
    const state = userId; // Pass user ID as state
    
    // Redirect to Kick OAuth
    window.location.href = `https://kick.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&scope=user:read`;
  };

  const handleDisconnectKick = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        kick_username: null,
        kick_connected_at: null,
      })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Hata",
        description: "Bağlantı koparılırken bir hata oluştu",
        variant: "destructive",
      });
    } else {
      setKickUsername(null);
      setKickConnectedAt(null);
      setSubscriberInfo(null);
      toast({
        title: "Bağlantı koparıldı",
        description: "Kick hesabınızın bağlantısı kesildi",
      });
    }
  };

  const getSubscriptionMonths = () => {
    if (!subscriberInfo) return 0;
    const now = new Date();
    const subscribedDate = new Date(subscriberInfo.subscribed_at);
    const months = Math.floor((now.getTime() - subscribedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return Math.max(1, months);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // This function is now handled by AvatarUpload component
    return;
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      const { error: prefsError } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          email_notifications: emailNotifications,
          show_nsfw: showNsfw,
          updated_at: new Date().toISOString(),
        });

      if (prefsError) throw prefsError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ bio })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast({
        title: "Ayarlar kaydedildi",
        description: "Tercihleriniz başarıyla güncellendi",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Ayarlar kaydedilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="page-content">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Settings className="h-10 w-10 text-primary" />
            Kullanıcı Ayarları
          </h1>
          <p className="text-muted-foreground">
            Hesabınızın tercihlerini ve görünüm ayarlarını yönetin
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profil Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                username={username}
                onUploadComplete={(url) => setAvatarUrl(url)}
              />

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-medium">
                  Hakkımda
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                  rows={4}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length}/500 karakter
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                E-posta Bildirimleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    E-posta bildirimleri al
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Yeni yorumlar, yanıtlar ve önemli güncellemeler için e-posta bildirimleri alın
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Kick Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Kick Hesabı Bağlantısı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!kickUsername ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Kick hesabınızı bağlayarak HadesOST kanalına abonelik durumunuzu gösterin
                  </p>
                  <Button onClick={handleConnectKick} className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Kick Hesabını Bağla
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">{kickUsername}</span>
                      </div>
                      {subscriberInfo && (
                        <div className="space-y-1">
                          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500">
                            {subscriberInfo.subscription_tier} Abone
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {getSubscriptionMonths()} aydır abone • {new Date(subscriberInfo.subscribed_at).toLocaleDateString('tr-TR')} tarihinden beri
                          </p>
                          {subscriberInfo.follower_since && (
                            <p className="text-xs text-muted-foreground">
                              Takipçi: {new Date(subscriberInfo.follower_since).toLocaleDateString('tr-TR')}
                            </p>
                          )}
                        </div>
                      )}
                      {!subscriberInfo && (
                        <p className="text-xs text-muted-foreground">
                          Abone değilsiniz
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDisconnectKick}>
                      Bağlantıyı Kes
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bağlantı tarihi: {new Date(kickConnectedAt!).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* NSFW Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                İçerik Filtreleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-nsfw" className="text-base font-medium">
                    Hassas içeriği göster
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    18+ veya hassas olarak işaretlenmiş içerikleri görmek istiyorsanız etkinleştirin
                  </p>
                </div>
                <Switch
                  id="show-nsfw"
                  checked={showNsfw}
                  onCheckedChange={setShowNsfw}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserSettings;
