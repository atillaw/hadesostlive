import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Check, Star, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import MinecraftNavbar from '@/components/minecraft/MinecraftNavbar';
import MinecraftFooter from '@/components/minecraft/MinecraftFooter';

const packages = [
  {
    name: 'VIP',
    price: 50,
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    features: [
      '/fly komutu',
      '2 ev set hakkı',
      'Renkli chat',
      'VIP rozeti',
    ],
  },
  {
    name: 'VIP+',
    price: 100,
    icon: Crown,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    features: [
      'Tüm VIP özellikleri',
      '/nick komutu',
      '5 ev set hakkı',
      'Özel kit',
      'VIP+ rozeti',
    ],
    popular: true,
  },
  {
    name: 'MVIP',
    price: 200,
    icon: Shield,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    features: [
      'Tüm VIP+ özellikleri',
      '/enderchest komutu',
      '10 ev set hakkı',
      'Özel eşyalar',
      'MVIP rozeti',
      'Öncelikli destek',
    ],
  },
];

const MinecraftVIP = () => {
  const [user, setUser] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['minecraft-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('minecraft_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const submitRequest = useMutation({
    mutationFn: async () => {
      if (!user || !selectedPackage) throw new Error('Giriş yapmalısınız');
      
      const { error } = await supabase
        .from('vip_requests')
        .insert({
          user_id: user.id,
          package_name: selectedPackage,
          message,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('VIP talebiniz başarıyla gönderildi!');
      setSelectedPackage(null);
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['vip-requests'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Bir hata oluştu');
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <MinecraftNavbar />
      
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="text-emerald-500">VIP</span> Paketleri
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            HadesOst sunucusunda özel ayrıcalıklar kazanın ve oyun deneyiminizi geliştirin
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {packages.map((pkg) => (
            <Card 
              key={pkg.name}
              className={`relative ${pkg.bgColor} ${pkg.borderColor} border-2 hover:scale-105 transition-transform duration-300`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  En Popüler
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <pkg.icon className={`w-12 h-12 mx-auto mb-4 ${pkg.color}`} />
                <CardTitle className={`text-2xl ${pkg.color}`}>{pkg.name}</CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground mt-2">
                  {pkg.price}₺<span className="text-sm text-muted-foreground">/aylık</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                      <Check className={`w-5 h-5 ${pkg.color}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => {
                    if (!user) {
                      toast.error('Lütfen önce giriş yapın');
                      return;
                    }
                    setSelectedPackage(pkg.name);
                  }}
                  className={`w-full ${pkg.popular ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-secondary hover:bg-secondary/80'}`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Satın Al
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Request Modal */}
      <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-emerald-500">
              {selectedPackage} Paketi Talebi
            </DialogTitle>
            <DialogDescription>
              Talebiniz admin tarafından incelenecek ve size ulaşılacaktır.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-background rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Minecraft Kullanıcı Adı</p>
              <p className="font-medium text-foreground">
                {profile?.minecraft_username || 'Profilde belirtilmedi'}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Mesajınız (opsiyonel)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ek bilgi veya notlarınız..."
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setSelectedPackage(null)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button 
              onClick={() => submitRequest.mutate()}
              disabled={submitRequest.isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {submitRequest.isPending ? 'Gönderiliyor...' : 'Talep Gönder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MinecraftFooter />
    </div>
  );
};

export default MinecraftVIP;
