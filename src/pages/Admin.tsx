import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "@/hooks/use-toast";

import { supabase } from "@/integrations/supabase/client";

import { LogOut, Settings, Mail, Heart, Clock, Video, Users, Timer, TrendingUp, MessageCircle, Megaphone, ImageIcon } from "lucide-react";

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

        <Tabs defaultValue="ideas" className="space-y-6">

          <TabsList className="grid grid-cols-2 md:grid-cols-10 gap-2">

            <TabsTrigger value="ideas">

              <Heart className="mr-2 h-4 w-4" />

              Fikirler

            </TabsTrigger>

            <TabsTrigger value="clock">

              <Clock className="mr-2 h-4 w-4" />

              Saat

            </TabsTrigger>

            <TabsTrigger value="countdown">

              <Timer className="mr-2 h-4 w-4" />

              Geri Sayım

            </TabsTrigger>

            <TabsTrigger value="subscribers">

              <Mail className="mr-2 h-4 w-4" />

              Aboneler

            </TabsTrigger>

            <TabsTrigger value="vods">

              <Video className="mr-2 h-4 w-4" />

              VODs

            </TabsTrigger>

            <TabsTrigger value="kick-subs">

              <TrendingUp className="mr-2 h-4 w-4" />

              Kick Subs

            </TabsTrigger>

            <TabsTrigger value="support">

              <MessageCircle className="mr-2 h-4 w-4" />

              Destek

            </TabsTrigger>

            <TabsTrigger value="adsense">

              <Megaphone className="mr-2 h-4 w-4" />

              AdSense

            </TabsTrigger>

            <TabsTrigger value="memes">

              <ImageIcon className="mr-2 h-4 w-4" />

              Memeler

            </TabsTrigger>

            {userRole === "admin" && (

              <TabsTrigger value="users">

                <Users className="mr-2 h-4 w-4" />

                Kullanıcılar

              </TabsTrigger>

            )}

          </TabsList>



          <TabsContent value="ideas">

            <AdminIdeas />

          </TabsContent>



          <TabsContent value="clock">

            <AdminClock />

          </TabsContent>



          <TabsContent value="countdown">

            <AdminCountdown />

          </TabsContent>



          <TabsContent value="subscribers">

            <AdminSubscribers />

          </TabsContent>



          <TabsContent value="vods">

            <AdminVODs />

          </TabsContent>



          <TabsContent value="kick-subs">

            <AdminKickSubscribers />

          </TabsContent>



          <TabsContent value="support">

            <AdminSupportChats />

          </TabsContent>



          <TabsContent value="adsense">

            <AdminAdSense />

          </TabsContent>



          <TabsContent value="memes">

            <AdminMemes />

          </TabsContent>



          {userRole === "admin" && (

            <TabsContent value="users">

              <AdminUsers />

            </TabsContent>

          )}

        </Tabs>

      </main>

    </div>

  );

};



export default Admin;

