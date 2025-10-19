import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
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

interface VOD {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
}

const AdminVODList = () => {
  const [vods, setVods] = useState<VOD[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchVODs = async () => {
    try {
      const { data, error } = await supabase
        .from('vods')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVods(data || []);
    } catch (error) {
      console.error('Error fetching VODs:', error);
      toast.error("VOD'lar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVODs();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('vods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("VOD başarıyla silindi");
      setVods(vods.filter(vod => vod.id !== id));
    } catch (error) {
      console.error('Error deleting VOD:', error);
      toast.error("VOD silinirken hata oluştu");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mevcut VOD'lar</CardTitle>
        <CardDescription>
          Toplam {vods.length} VOD
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {vods.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Henüz VOD bulunmuyor
            </p>
          ) : (
            vods.map((vod) => (
              <div
                key={vod.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {vod.thumbnail_url && (
                  <img
                    src={vod.thumbnail_url}
                    alt={vod.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{vod.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {vod.video_url}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(vod.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === vod.id}
                    >
                      {deletingId === vod.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu VOD kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(vod.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminVODList;
