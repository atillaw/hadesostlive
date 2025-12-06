import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User, Save, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import MinecraftNavbar from '@/components/minecraft/MinecraftNavbar';
import MinecraftFooter from '@/components/minecraft/MinecraftFooter';

const MinecraftProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['minecraft-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('minecraft_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setMinecraftUsername(data.minecraft_username || '');
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: vipRequests } = useQuery({
    queryKey: ['vip-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('vip_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Giriş yapmalısınız');
      
      if (profile) {
        const { error } = await supabase
          .from('minecraft_profiles')
          .update({ 
            minecraft_username: minecraftUsername,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('minecraft_profiles')
          .insert({ 
            user_id: user.id,
            minecraft_username: minecraftUsername 
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Profil güncellendi!');
      queryClient.invalidateQueries({ queryKey: ['minecraft-profile'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Bir hata oluştu');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Onaylandı</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Beklemede</Badge>;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <MinecraftNavbar />
      
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-8">Minecraft Profilim</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-emerald-500 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profil Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Minecraft Skin */}
              <div className="flex justify-center">
                <img
                  src={minecraftUsername 
                    ? `https://minotar.net/armor/body/${minecraftUsername}/150.png`
                    : 'https://minotar.net/armor/body/MHF_Steve/150.png'
                  }
                  alt="Minecraft Skin"
                  className="h-40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://minotar.net/armor/body/MHF_Steve/150.png';
                  }}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">
                    E-posta
                  </label>
                  <Input 
                    value={user.email || ''} 
                    disabled 
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-2">
                    Minecraft Kullanıcı Adı
                  </label>
                  <Input 
                    value={minecraftUsername}
                    onChange={(e) => setMinecraftUsername(e.target.value)}
                    placeholder="Minecraft kullanıcı adınız"
                    className="bg-background/50"
                  />
                </div>

                <Button 
                  onClick={() => updateProfile.mutate()}
                  disabled={updateProfile.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfile.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* VIP Requests */}
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-emerald-500 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                VIP Taleplerim
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vipRequests && vipRequests.length > 0 ? (
                <div className="space-y-4">
                  {vipRequests.map((request: any) => (
                    <div 
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{request.package_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Henüz VIP talebiniz yok</p>
                  <Button 
                    onClick={() => navigate('/minecraft/vip')}
                    variant="link"
                    className="text-emerald-500 mt-2"
                  >
                    VIP paketlerini incele →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <MinecraftFooter />
    </div>
  );
};

export default MinecraftProfile;
