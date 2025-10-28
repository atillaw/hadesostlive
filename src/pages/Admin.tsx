import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
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
import AdminClips from "@/components/admin/AdminClips";
import AdminLogs from "@/components/admin/AdminLogs";
import AdminAnalytics from "@/components/admin/AdminAnalytics";



const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [activeTab, setActiveTab] = useState("analytics");



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

      const { data: roles } = await supabase

        .from("user_roles")

        .select("role")

        .eq("user_id", session.user.id)

        .single();



      if (!roles) {

        toast({

          title: "Erişim Reddedildi",

          description: "Admin yetkisi bulunamadı.",

          variant: "destructive",

        });

        navigate("/");

        return;

      }



      setUserRole(roles.role);



      // Get username

      const { data: profile } = await supabase

        .from("profiles")

        .select("username")

        .eq("id", session.user.id)

        .single();



      setUsername(profile?.username || "Admin");

      setLoading(false);

    } catch (error) {

      navigate("/auth");

    }

  };



  const handleLogout = async () => {

    await supabase.auth.signOut();

    navigate("/");

    toast({

      title: "Çıkış Yapıldı",

      description: "Başarıyla çıkış yaptınız.",

    });

  };



  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="text-center">

          <div className="animate-pulse text-2xl font-bold glow-text">Yükleniyor...</div>

        </div>

      </div>

    );

  }



  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return <AdminAnalytics />;
      case "ideas":
        return <AdminIdeas />;
      case "clock":
        return <AdminClock />;
      case "countdown":
        return <AdminCountdown />;
      case "subscribers":
        return <AdminSubscribers />;
      case "vods":
        return <AdminVODs />;
      case "kick-subs":
        return <AdminKickSubscribers />;
      case "support":
        return <AdminSupportChats />;
      case "adsense":
        return <AdminAdSense />;
      case "memes":
        return <AdminMemes />;
      case "clips":
        return <AdminClips />;
      case "logs":
        return <AdminLogs />;
      case "users":
        return userRole === "admin" ? <AdminUsers /> : null;
      default:
        return <AdminAnalytics />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar 
          userRole={userRole} 
          onTabChange={setActiveTab}
          activeTab={activeTab}
        />
        
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
            <div className="px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-10 w-10" />
                <div>
                  <h1 className="text-2xl font-bold glow-text">Admin Paneli</h1>
                  <p className="text-sm text-muted-foreground">Hoş geldin, {username}</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" className="rounded-full">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );

};



export default Admin;

