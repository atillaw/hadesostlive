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
import { Settings, Mail, Eye, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/AvatarUpload";
import { KickConnectionCard } from "@/components/KickConnectionCard";

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
  
  // Kick OAuth error state
  const [kickError, setKickError] = useState(false);

  useEffect(() => {
    loadUser();
    
    // Check if returning from Kick OAuth
    if (searchParams.get("kick_connected") === "success") {
      toast({
        title: "Kick hesabı bağlandı!",
        description: "Kick hesabınız başarıyla bağlandı.",
      });
      window.history.replaceState({}, "", "/kullanici-ayarlari");
    }
    
    // Check for OAuth errors
    const kickErrorParam = searchParams.get("kick_error");
    if (kickErrorParam) {
      setKickError(true);
      const errorMessages: Record<string, string> = {
        missing_params: "OAuth bağlantısı sırasında gerekli parametreler eksik",
        auth_failed: "Kick ile kimlik doğrulama başarısız oldu",
        user_fetch_failed: "Kick kullanıcı bilgileri alınamadı",
        profile_update_failed: "Profil güncellenirken bir hata oluştu",
        invalid_state: "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.",
        state_expired: "Oturum süresi doldu. Lütfen tekrar deneyin.",
        token_exchange_failed: "Token alınamadı. Lütfen tekrar deneyin.",
        server_error: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
      };
      
      toast({
        title: "Bağlantı Başarısız",
        description: errorMessages[kickErrorParam] || "Kick hesabı bağlanırken bir hata oluştu",
        variant: "destructive",
      });
      
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
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      setUsername(profile.username);
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
          <KickConnectionCard 
            hasError={kickError} 
            onConnectionChange={() => setKickError(false)} 
          />

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
