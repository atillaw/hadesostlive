import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Check, X, Trash2 } from "lucide-react";

interface ClipUpload {
  id: string;
  title: string;
  file_path: string;
  category: string;
  status: string;
  user_identifier: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  gameplay: "🎮 Oyun Anları",
  funny: "😂 Komik",
  music: "🎵 Müzik",
  other: "📁 Diğer",
};

const AdminClips = () => {
  const [clips, setClips] = useState<ClipUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClips();
  }, []);

  const fetchClips = async () => {
    try {
      const { data, error } = await supabase
        .from('clips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClips(data || []);
    } catch (error) {
      console.error("Error fetching clips:", error);
      toast.error("Klipler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (action: string, recordId: string, details: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('admin_logs').insert({
        user_id: user.id,
        action,
        table_name: 'clips',
        record_id: recordId,
        details,
      });
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from('clips').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleApprove = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('clips')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', id);

      if (error) throw error;
      
      await logAction('approve', id, { status: 'approved' });
      toast.success("Klip onaylandı");
      fetchClips();
    } catch (error: any) {
      toast.error("Onaylama başarısız: " + error.message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clips')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      
      await logAction('reject', id, { status: 'rejected' });
      toast.success("Klip reddedildi");
      fetchClips();
    } catch (error: any) {
      toast.error("Reddetme başarısız: " + error.message);
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('clips')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('clips')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      await logAction('delete', id, { file_path: filePath });
      toast.success("Klip silindi");
      fetchClips();
    } catch (error: any) {
      toast.error("Silme başarısız: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Onaylandı</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge variant="secondary">Beklemede</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Klip Yönetimi</h2>
      
      {clips.length === 0 ? (
        <p className="text-muted-foreground">Henüz klip yüklenmemiş.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clips.map((clip) => {
            const fileUrl = getFileUrl(clip.file_path);
            const isVideo = clip.file_path.match(/\.(mp4|webm|mov)$/i);
            
            return (
              <div key={clip.id} className="border rounded-lg p-4 space-y-3">
                <div className="aspect-video bg-muted rounded flex items-center justify-center">
                  {isVideo ? (
                    <video src={fileUrl} controls className="w-full h-full rounded">
                      Tarayıcınız video oynatmayı desteklemiyor.
                    </video>
                  ) : (
                    <audio src={fileUrl} controls className="w-full">
                      Tarayıcınız ses oynatmayı desteklemiyor.
                    </audio>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold line-clamp-1">{clip.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{categoryLabels[clip.category]}</Badge>
                    {getStatusBadge(clip.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Kullanıcı: {clip.user_identifier}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(clip.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>

                <div className="flex gap-2">
                  {clip.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(clip.id)}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(clip.id)}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reddet
                      </Button>
                    </>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Silmek istediğinizden emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu işlem geri alınamaz. Klip kalıcı olarak silinecektir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(clip.id, clip.file_path)}>
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminClips;