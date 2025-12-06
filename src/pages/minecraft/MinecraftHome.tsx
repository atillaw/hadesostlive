import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Check, Users, Wifi, WifiOff, ChevronRight, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import MinecraftNavbar from '@/components/minecraft/MinecraftNavbar';
import MinecraftFooter from '@/components/minecraft/MinecraftFooter';

const SERVER_IP = 'mc.hadesost.uk';

interface ServerStatus {
  online: boolean;
  players?: {
    online: number;
    max: number;
  };
  version?: string;
  motd?: {
    clean: string[];
  };
}

const MinecraftHome = () => {
  const [copied, setCopied] = useState(false);

  const { data: serverStatus, isLoading: serverLoading } = useQuery({
    queryKey: ['minecraft-server-status'],
    queryFn: async (): Promise<ServerStatus> => {
      const res = await fetch(`https://api.mcsrvstat.us/2/${SERVER_IP}`);
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: announcements } = useQuery({
    queryKey: ['minecraft-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('minecraft_announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const copyIP = async () => {
    await navigator.clipboard.writeText(SERVER_IP);
    setCopied(true);
    toast.success('Sunucu IP kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <MinecraftNavbar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920)',
            filter: 'brightness(0.3)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Gamepad2 className="w-12 h-12 text-emerald-500" />
            <h1 className="text-5xl md:text-7xl font-bold text-white">
              Hades<span className="text-emerald-500">Ost</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Türkiye'nin En İyi Minecraft Sunucusu
          </p>
          
          {/* Server Status */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 bg-card/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-border">
              {serverLoading ? (
                <div className="animate-pulse flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded-full" />
                  <span className="text-muted-foreground">Yükleniyor...</span>
                </div>
              ) : serverStatus?.online ? (
                <>
                  <Wifi className="w-6 h-6 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Çevrimiçi</span>
                  <div className="w-px h-6 bg-border" />
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {serverStatus.players?.online || 0}/{serverStatus.players?.max || 0}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-6 h-6 text-destructive" />
                  <span className="text-destructive font-semibold">Çevrimdışı</span>
                </>
              )}
            </div>
            
            {/* IP Copy Button */}
            <Button 
              onClick={copyIP}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-xl gap-3"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Kopyalandı!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  {SERVER_IP}
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-8">
        {/* Announcements */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-500 flex items-center gap-2">
              📢 Duyurular
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements && announcements.length > 0 ? (
              announcements.map((announcement: any) => (
                <div 
                  key={announcement.id}
                  className="p-4 bg-background/50 rounded-xl border border-border hover:border-emerald-500/50 transition-colors"
                >
                  <h3 className="font-semibold text-foreground mb-2">{announcement.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{announcement.content}</p>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {new Date(announcement.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">Henüz duyuru yok</p>
            )}
          </CardContent>
        </Card>

        {/* Dynmap */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-500 flex items-center gap-2">
              🗺️ Canlı Harita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-xl overflow-hidden border border-border">
              <iframe
                src="https://harita.hadesost.uk/?worldname=world&mapname=flat&zoom=4&x=432&y=64&z=-426"
                className="w-full h-full"
                title="Dynmap"
                loading="lazy"
              />
            </div>
            <a 
              href="https://harita.hadesost.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 mt-4 text-sm"
            >
              Haritayı tam ekran aç <ChevronRight className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Neden <span className="text-emerald-500">HadesOst</span>?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '⚔️', title: 'Survival', desc: 'Vanilla deneyimi ile hayatta kal' },
            { icon: '🏰', title: 'Koruma', desc: 'Arazini koru, griefing yok' },
            { icon: '💎', title: 'Ekonomi', desc: 'Oyuncu pazarı ve ticaret sistemi' },
          ].map((feature) => (
            <Card 
              key={feature.title}
              className="bg-card/50 backdrop-blur-sm border-border hover:border-emerald-500/50 transition-all hover:scale-105"
            >
              <CardContent className="pt-6 text-center">
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <MinecraftFooter />
    </div>
  );
};

export default MinecraftHome;
