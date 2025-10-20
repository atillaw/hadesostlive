import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MemeUpload {
  id: string;
  title: string;
  image_path: string;
  status: string;
  user_identifier: string;
  created_at: string;
}

const AdminMemes = () => {
  const [memes, setMemes] = useState<MemeUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      const { data, error } = await supabase
        .from('meme_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemes(data || []);
    } catch (error: any) {
      console.error('Error fetching memes:', error);
      toast.error("Memeler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage
      .from('memes')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const handleApprove = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('meme_uploads')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Meme onaylandı!");
      fetchMemes();
    } catch (error: any) {
      console.error('Error approving meme:', error);
      toast.error("Onaylama sırasında hata oluştu");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meme_uploads')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Meme reddedildi");
      fetchMemes();
    } catch (error: any) {
      console.error('Error rejecting meme:', error);
      toast.error("Reddetme sırasında hata oluştu");
    }
  };

  const handleDelete = async (id: string, imagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('memes')
        .remove([imagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('meme_uploads')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      
      toast.success("Meme silindi");
      fetchMemes();
    } catch (error: any) {
      console.error('Error deleting meme:', error);
      toast.error("Silme sırasında hata oluştu");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Beklemede</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Onaylandı</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meme Yönetimi</h2>
        <div className="text-sm text-muted-foreground">
          Toplam: {memes.length} | Bekleyen: {memes.filter(m => m.status === 'pending').length}
        </div>
      </div>

      {memes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Henüz yüklenmiş meme yok
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memes.map((meme) => (
            <Card key={meme.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{meme.title}</CardTitle>
                  {getStatusBadge(meme.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={getImageUrl(meme.image_path)}
                  alt={meme.title}
                  className="w-full h-48 object-cover rounded"
                />
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Kullanıcı: {meme.user_identifier}</p>
                  <p>Tarih: {new Date(meme.created_at).toLocaleString('tr-TR')}</p>
                </div>

                <div className="flex gap-2">
                  {meme.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleApprove(meme.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReject(meme.id)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reddet
                      </Button>
                    </>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className={meme.status === 'pending' ? '' : 'flex-1'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Meme'i sil?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu işlem geri alınamaz. Meme kalıcı olarak silinecek.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(meme.id, meme.image_path)}
                        >
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMemes;
