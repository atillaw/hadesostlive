import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Pin, Lock, Trash2, Ban } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PostModerationToolsProps {
  postId: string;
  isPinned: boolean;
  isLocked: boolean;
  authorUsername: string;
  onUpdate: () => void;
}

const PostModerationTools = ({
  postId,
  isPinned,
  isLocked,
  authorUsername,
  onUpdate,
}: PostModerationToolsProps) => {
  const [isModerator, setIsModerator] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    checkModeratorStatus();
  }, []);

  const checkModeratorStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user is admin or moderator
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (roles && roles.length > 0) {
      const hasModRole = roles.some(
        (r) =>
          r.role === "admin" ||
          r.role === "super_admin" ||
          r.role === "global_mod"
      );
      setIsModerator(hasModRole);
    }
  };

  const handlePin = async () => {
    const { error } = await supabase
      .from("posts")
      .update({ is_pinned: !isPinned })
      .eq("id", postId);

    if (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: isPinned ? "Sabitleme kaldırıldı" : "Gönderi sabitlendi",
      });
      onUpdate();
    }
  };

  const handleLock = async () => {
    const { error } = await supabase
      .from("posts")
      .update({ is_locked: !isLocked })
      .eq("id", postId);

    if (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: isLocked
          ? "Gönderi kilidi açıldı"
          : "Gönderi kilitlendi",
      });
      onUpdate();
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("posts")
      .update({ is_deleted: true })
      .eq("id", postId);

    if (error) {
      toast({
        title: "Hata",
        description: "Silme işlemi başarısız",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Gönderi silindi",
      });
      onUpdate();
    }
    setShowDeleteDialog(false);
  };

  const handleBan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", authorUsername)
      .single();

    if (!profile) {
      toast({
        title: "Hata",
        description: "Kullanıcı bulunamadı",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("user_bans").insert({
      user_id: profile.id,
      banned_by: user.id,
      reason: "Moderatör tarafından yasaklandı",
      is_permanent: false,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });

    if (error) {
      toast({
        title: "Hata",
        description: "Yasaklama işlemi başarısız",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Başarılı",
        description: "Kullanıcı 7 gün yasaklandı",
      });
    }
    setShowBanDialog(false);
  };

  if (!isModerator) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handlePin}>
            <Pin className="h-4 w-4 mr-2" />
            {isPinned ? "Sabitlemeyi Kaldır" : "Sabitle"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLock}>
            <Lock className="h-4 w-4 mr-2" />
            {isLocked ? "Kilidi Aç" : "Kilitle"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Sil
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowBanDialog(true)}
            className="text-red-600"
          >
            <Ban className="h-4 w-4 mr-2" />
            Kullanıcıyı Yasakla
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gönderiyi silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Gönderi kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {authorUsername} kullanıcısını yasaklamak istiyor musunuz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Kullanıcı 7 gün boyunca yasaklanacak ve gönderi/yorum yapamayacak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBan} className="bg-red-600">
              Yasakla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostModerationTools;
