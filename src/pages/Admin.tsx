import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Settings, Mail, Heart, Clock, Video, Users, Timer, TrendingUp, MessageCircle, Megaphone, ImageIcon, ListChecks } from "lucide-react"; // ListChecks ikonu eklendi
import AdminIdeas from "@/components/admin/AdminIdeas";
import AdminClock from "@/components/admin/AdminClock";
import AdminCountdown from "@/components/admin/AdminCountdown";
import AdminSubscribers from "@/components/admin/AdminSubscribers";
import AdminVODs from "@/components/admin/AdminVODs";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminKickSubscribers from "@/components/admin/AdminKickSubscribers";
import AdminSupportChats from "@/components/admin/AdminSupportChats";
import AdminAdSense from "@/components/admin/AdminAdSense";
import AdminMemes from "@/components/admin/AdminMemes";
import AdminLogs from "@/components/admin/AdminLogs"; // AdminLogs import edildi

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      // Get user role
      const { data: rolesData, error: rolesError } = await supabase // Değişken adı rolesData olarak değiştirildi
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single(); // maybeSingle yerine single kullanıldı

      // Hata kontrolü eklendi
      if (rolesError || !rolesData) {
         // Eğer hata "PGRST116" (tek satır beklenirken sonuç bulunamadı veya birden fazla bulundu) ise veya rolesData yoksa yetki yok kabul edelim.
         // Diğer DB hataları için loglama yapılabilir.
         console.error("Role check failed or no role found:", rolesError);
         toast({
           title: "Erişim Reddedildi",
           description: "Admin yetkisi bulunamadı veya rol bilgisi alınamadı.",
           variant: "destructive",
         });
         // Kullanıcıyı ana sayfaya yönlendirmeden önce çıkış yaptırmak daha güvenli olabilir
         await supabase.auth.signOut();
         navigate("/");
         return;
      }

       // Sadece admin rolüne sahip olanların devam etmesini sağlayalım
       // Eğer 'editor' veya 'developer' gibi başka roller de panele girebilecekse bu kontrolü kaldırın veya genişletin.
       if (rolesData.role !== 'admin') {
           toast({
               title: "Yetki Yetersiz",
               description: "Bu panele erişim için admin yetkisi gereklidir.",
               variant: "destructive",
           });
           await supabase.auth.signOut();
           navigate("/");
           return;
       }

      setUserRole(rolesData.role);

      // Get username
      const { data: profile, error: profileError } = await supabase // Hata kontrolü eklendi
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single(); // maybeSingle yerine single

        // Profil bulunamazsa veya hata olursa loglayıp devam edelim, username default kalsın.
      if (profileError || !profile) {
          console.error("Failed to fetch profile username:", profileError);
          setUsername("Admin"); // Default değer
      } else {
          setUsername(profile.username);
      }

      setLoading(false);
    } catch (error) {
       console.error("Authentication check general error:", error); // Genel hataları da loglayalım
       // Beklenmedik bir hata olursa kullanıcıyı auth sayfasına yönlendirelim
       toast({ title: "Oturum Hatası", description: "Oturum kontrol edilirken bir hata oluştu.", variant: "destructive"});
       navigate("/auth");
    }
  };


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut(); // Hata kontrolü eklendi
    if (error) {
         console.error("Logout error:", error);
         toast({ title: "Çıkış Hatası", description: "Çıkış yapılırken bir hata oluştu.", variant: "destructive"});
    } else {
        navigate("/"); // Başarılıysa yönlendir
        toast({
          title: "Çıkış Yapıldı",
          description: "Başarıyla çıkış yaptınız.",
        });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" /> {/* Loader eklendi */}
          <div className="text-xl font-semibold text-muted-foreground">Yükleniyor...</div>
        </div>
      </div>
    );
  }

   // Eğer userRole hala null ise (beklenmedik bir durum), veya admin değilse erişimi engelle
   // Bu ek kontrol, checkAuth içindeki yönlendirmeler çalışmazsa diye bir güvenlik katmanı sağlar.
   if (userRole !== 'admin') {
       return (
           <div className="min-h-screen flex items-center justify-center">
               <div className="text-center p-8 bg-card rounded-lg shadow-lg">
                   <h1 className="text-2xl font-bold text-destructive mb-4">Erişim Reddedildi</h1>
                   <p className="text-muted-foreground mb-4">Bu sayfayı görüntüleme yetkiniz yok.</p>
                   <Button onClick={() => navigate('/')}>Ana Sayfaya Dön</Button>
               </div>
           </div>
       );
   }


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold glow-text">Admin Paneli</h1>
            <p className="text-sm text-muted-foreground">Hoş geldin, {username}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Varsayılan sekme 'users' veya 'logs' olabilir */}
        <Tabs defaultValue="users" className="space-y-6">
          {/* Grid sütun sayısını 11'e çıkarın */}
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-1 sm:gap-2">
            <TabsTrigger value="ideas">
              <Heart className="mr-1 sm:mr-2 h-4 w-4" /> Fikirler
            </TabsTrigger>
            <TabsTrigger value="clock">
              <Clock className="mr-1 sm:mr-2 h-4 w-4" /> Saat
            </TabsTrigger>
            <TabsTrigger value="countdown">
              <Timer className="mr-1 sm:mr-2 h-4 w-4" /> Geri Sayım
            </TabsTrigger>
            <TabsTrigger value="subscribers">
              <Mail className="mr-1 sm:mr-2 h-4 w-4" /> Aboneler
            </TabsTrigger>
            <TabsTrigger value="vods">
              <Video className="mr-1 sm:mr-2 h-4 w-4" /> VODs
            </TabsTrigger>
            <TabsTrigger value="kick-subs">
              <TrendingUp className="mr-1 sm:mr-2 h-4 w-4" /> Kick Subs
            </TabsTrigger>
            <TabsTrigger value="support">
              <MessageCircle className="mr-1 sm:mr-2 h-4 w-4" /> Destek
            </TabsTrigger>
            <TabsTrigger value="adsense">
              <Megaphone className="mr-1 sm:mr-2 h-4 w-4" /> AdSense
            </TabsTrigger>
            <TabsTrigger value="memes">
              <ImageIcon className="mr-1 sm:mr-2 h-4 w-4" /> Memeler
            </TabsTrigger>
            {/* userRole === 'admin' kontrolü burada da kalabilir ama zaten yukarıda kontrol ettik */}
            {/* {userRole === "admin" && ( */}
              <TabsTrigger value="users">
                <Users className="mr-1 sm:mr-2 h-4 w-4" /> Kullanıcılar
              </TabsTrigger>
            {/* )} */}
            {/* Yeni Loglar sekmesi */}
            {/* {userRole === "admin" && ( */}
              <TabsTrigger value="logs">
                <ListChecks className="mr-1 sm:mr-2 h-4 w-4" /> Loglar
              </TabsTrigger>
            {/* )} */}
          </TabsList>

          <TabsContent value="ideas"><AdminIdeas /></TabsContent>
          <TabsContent value="clock"><AdminClock /></TabsContent>
          <TabsContent value="countdown"><AdminCountdown /></TabsContent>
          <TabsContent value="subscribers"><AdminSubscribers /></TabsContent>
          <TabsContent value="vods"><AdminVODs /></TabsContent>
          <TabsContent value="kick-subs"><AdminKickSubscribers /></TabsContent>
          <TabsContent value="support"><AdminSupportChats /></TabsContent>
          <TabsContent value="adsense"><AdminAdSense /></TabsContent>
          <TabsContent value="memes"><AdminMemes /></TabsContent>

          {/* userRole kontrolü burada da kalabilir */}
          {/* {userRole === "admin" && ( */}
            <>
              <TabsContent value="users"><AdminUsers /></TabsContent>
              <TabsContent value="logs"><AdminLogs /></TabsContent>
            </>
          {/* )} */}
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
