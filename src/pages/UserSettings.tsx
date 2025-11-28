import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Mail, Palette, Eye, User, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const UserSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [showNsfw, setShowNsfw] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

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
      setTheme(prefs.theme ?? "dark");
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Dosya çok büyük",
        description: "Avatar dosyası 2MB'dan küçük olmalı",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Avatar güncellendi",
        description: "Profil resminiz başarıyla yüklendi",
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Hata",
        description: "Avatar yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      // Update preferences
      const { error: prefsError } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          email_notifications: emailNotifications,
          theme,
          show_nsfw: showNsfw,
          updated_at: new Date().toISOString(),
        });

      if (prefsError) throw prefsError;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ bio })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast({
        title: "Ayarlar kaydedildi",
        description: "Tercihleriniz başarıyla güncellendi",
      });

      // Apply theme
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      console.error("Settings save error:", error);
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu",
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
              <div className="space-y-2">
                <Label className="text-base font-medium">Profil Resmi</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="avatar-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        onClick={() => document.getElementById("avatar-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? "Yükleniyor..." : "Resim Yükle"}
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG veya GIF. Maksimum 2MB.
                    </p>
                  </div>
                </div>
              </div>

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

          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Tema Tercihi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-base font-medium">
                  Görünüm teması
                </Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Tema seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Koyu Tema</SelectItem>
                    <SelectItem value="light">Açık Tema</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Site genelinde kullanılacak renk temasını seçin
                </p>
              </div>
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
