import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Mail, Megaphone, 
  CheckCircle, XCircle, Clock, Eye, Plus, Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import MinecraftNavbar from '@/components/minecraft/MinecraftNavbar';

const MinecraftAdmin = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', image_url: '' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);

      // Check if user has admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        toast.error('Bu sayfaya erişim yetkiniz yok');
        navigate('/minecraft');
        return;
      }
      setIsAdmin(true);
    };

    checkAdmin();
  }, [navigate]);

  const { data: vipRequests } = useQuery({
    queryKey: ['admin-vip-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vip_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: contactMessages } = useQuery({
    queryKey: ['admin-contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('minecraft_contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: announcements } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('minecraft_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const updateVIPStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('vip_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Durum güncellendi');
      queryClient.invalidateQueries({ queryKey: ['admin-vip-requests'] });
    },
  });

  const markMessageRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('minecraft_contact_messages')
        .update({ status: 'read' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] });
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async () => {
      if (!newAnnouncement.title || !newAnnouncement.content) {
        throw new Error('Başlık ve içerik zorunludur');
      }
      const { error } = await supabase
        .from('minecraft_announcements')
        .insert(newAnnouncement);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Duyuru eklendi');
      setNewAnnouncement({ title: '', content: '', image_url: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('minecraft_announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Duyuru silindi');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
  });

  if (!isAdmin) return null;

  const pendingRequests = vipRequests?.filter((r: any) => r.status === 'pending').length || 0;
  const unreadMessages = contactMessages?.filter((m: any) => m.status === 'unread').length || 0;

  return (
    <div className="min-h-screen bg-background">
      <MinecraftNavbar />
      
      <section className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Minecraft Admin Paneli</h1>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
            <TabsTrigger value="vip"><Package className="w-4 h-4 mr-2" />VIP Talepleri</TabsTrigger>
            <TabsTrigger value="messages"><Mail className="w-4 h-4 mr-2" />Mesajlar</TabsTrigger>
            <TabsTrigger value="announcements"><Megaphone className="w-4 h-4 mr-2" />Duyurular</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Bekleyen VIP</CardTitle>
                  <Package className="w-4 h-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{pendingRequests}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Okunmamış Mesaj</CardTitle>
                  <Mail className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{unreadMessages}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Duyuru</CardTitle>
                  <Megaphone className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{announcements?.length || 0}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* VIP Requests */}
          <TabsContent value="vip">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>VIP Talepleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vipRequests?.map((request: any) => (
                    <div 
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{request.package_name}</p>
                        <p className="text-sm text-muted-foreground">{request.message || 'Mesaj yok'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(request.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateVIPStatus.mutate({ id: request.id, status: 'approved' })}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateVIPStatus.mutate({ id: request.id, status: 'rejected' })}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Badge className={request.status === 'approved' ? 'bg-emerald-500' : 'bg-destructive'}>
                            {request.status === 'approved' ? 'Onaylı' : 'Reddedildi'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>İletişim Mesajları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactMessages?.map((msg: any) => (
                    <div 
                      key={msg.id}
                      className={`p-4 bg-background rounded-lg border ${msg.status === 'unread' ? 'border-emerald-500' : 'border-border'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{msg.subject}</p>
                          <p className="text-sm text-muted-foreground">{msg.email}</p>
                        </div>
                        {msg.status === 'unread' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markMessageRead.mutate(msg.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Okundu
                          </Button>
                        )}
                      </div>
                      <p className="text-muted-foreground">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(msg.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements */}
          <TabsContent value="announcements">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Yeni Duyuru</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Başlık"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="bg-background"
                  />
                  <Textarea
                    placeholder="İçerik"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    rows={4}
                    className="bg-background"
                  />
                  <Input
                    placeholder="Görsel URL (opsiyonel)"
                    value={newAnnouncement.image_url}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, image_url: e.target.value })}
                    className="bg-background"
                  />
                  <Button 
                    onClick={() => createAnnouncement.mutate()}
                    disabled={createAnnouncement.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Duyuru Ekle
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Mevcut Duyurular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {announcements?.map((ann: any) => (
                      <div 
                        key={ann.id}
                        className="flex justify-between items-start p-4 bg-background rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{ann.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{ann.content}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteAnnouncement.mutate(ann.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default MinecraftAdmin;
