import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Heart, MessageSquare, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Clip {
  id: string;
  title: string;
  file_path: string;
  category: string;
  created_at: string;
}

interface ClipLike {
  id: string;
  clip_id: string;
  user_id: string | null;
  user_identifier: string | null;
}

interface ClipComment {
  id: string;
  clip_id: string;
  user_id: string | null;
  user_identifier: string | null;
  comment: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  gameplay: "🎮 Oyun Anları",
  funny: "😂 Komik",
  music: "🎵 Müzik",
  other: "📁 Diğer",
};

const Clips = () => {
  const navigate = useNavigate();
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [likes, setLikes] = useState<Record<string, ClipLike[]>>({});
  const [comments, setComments] = useState<Record<string, ClipComment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string>("");

  useEffect(() => {
    fetchClips();
    checkUser();
    setupRealtimeSubscriptions();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    } else {
      const storedId = localStorage.getItem("clip_user_id");
      if (storedId) {
        setUserIdentifier(storedId);
      } else {
        const newId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("clip_user_id", newId);
        setUserIdentifier(newId);
      }
    }
  };

  const setupRealtimeSubscriptions = () => {
    const likesChannel = supabase
      .channel('clip_likes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clip_likes' }, 
        () => fetchLikesAndComments()
      )
      .subscribe();

    const commentsChannel = supabase
      .channel('clip_comments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clip_comments' }, 
        () => fetchLikesAndComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  };

  const fetchClips = async () => {
    try {
      const { data, error } = await supabase
        .from('clips')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClips(data || []);
      
      if (data) {
        fetchLikesAndComments();
      }
    } catch (error) {
      console.error("Error fetching clips:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikesAndComments = async () => {
    try {
      const { data: likesData } = await supabase
        .from('clip_likes')
        .select('*');
      
      const { data: commentsData } = await supabase
        .from('clip_comments')
        .select('*')
        .order('created_at', { ascending: true });

      const likesMap: Record<string, ClipLike[]> = {};
      likesData?.forEach(like => {
        if (!likesMap[like.clip_id]) likesMap[like.clip_id] = [];
        likesMap[like.clip_id].push(like);
      });

      const commentsMap: Record<string, ClipComment[]> = {};
      commentsData?.forEach(comment => {
        if (!commentsMap[comment.clip_id]) commentsMap[comment.clip_id] = [];
        commentsMap[comment.clip_id].push(comment);
      });

      setLikes(likesMap);
      setComments(commentsMap);
    } catch (error) {
      console.error("Error fetching likes/comments:", error);
    }
  };

  const handleLike = async (clipId: string) => {
    const clipLikes = likes[clipId] || [];
    const existingLike = clipLikes.find(like => 
      (userId && like.user_id === userId) || 
      (!userId && like.user_identifier === userIdentifier)
    );

    if (existingLike) {
      const { error } = await supabase
        .from('clip_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (error) {
        toast.error("Beğeni kaldırılamadı");
        return;
      }
    } else {
      const { error } = await supabase
        .from('clip_likes')
        .insert({
          clip_id: clipId,
          user_id: userId,
          user_identifier: userId ? null : userIdentifier
        });
      
      if (error) {
        toast.error("Beğeni eklenemedi");
        return;
      }
    }
  };

  const handleComment = async (clipId: string) => {
    const comment = newComment[clipId]?.trim();
    if (!comment) return;

    const { error } = await supabase
      .from('clip_comments')
      .insert({
        clip_id: clipId,
        user_id: userId,
        user_identifier: userId ? null : userIdentifier,
        comment
      });

    if (error) {
      toast.error("Yorum eklenemedi");
      return;
    }

    setNewComment(prev => ({ ...prev, [clipId]: "" }));
    toast.success("Yorum eklendi");
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('clip_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast.error("Yorum silinemedi");
      return;
    }
    
    toast.success("Yorum silindi");
  };

  const isLikedByUser = (clipId: string) => {
    const clipLikes = likes[clipId] || [];
    return clipLikes.some(like => 
      (userId && like.user_id === userId) || 
      (!userId && like.user_identifier === userIdentifier)
    );
  };

  const canDeleteComment = (comment: ClipComment) => {
    return (userId && comment.user_id === userId) || 
           (!userId && comment.user_identifier === userIdentifier);
  };

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from('clips').getPublicUrl(path);
    return data.publicUrl;
  };

  const filteredClips = selectedCategory
    ? clips.filter(clip => clip.category === selectedCategory)
    : clips;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 glow-text">Klipler</h1>
          <p className="text-muted-foreground mb-6">
            En iyi oyun anları, komik videolar ve ses kayıtları
          </p>
          <Button onClick={() => navigate("/klip-yukle")} className="mb-6">
            <Upload className="mr-2 h-4 w-4" />
            Klip Yükle
          </Button>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              Tümü
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                onClick={() => setSelectedCategory(key)}
                size="sm"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {filteredClips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Henüz klip yüklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClips.map((clip) => {
              const fileUrl = getFileUrl(clip.file_path);
              const isVideo = clip.file_path.match(/\.(mp4|webm|mov)$/i);
              const clipLikes = likes[clip.id] || [];
              const clipComments = comments[clip.id] || [];
              const isLiked = isLikedByUser(clip.id);
              
              return (
                <div key={clip.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {isVideo ? (
                      <video src={fileUrl} controls className="w-full h-full">
                        Tarayıcınız video oynatmayı desteklemiyor.
                      </video>
                    ) : (
                      <audio src={fileUrl} controls className="w-full px-4">
                        Tarayıcınız ses oynatmayı desteklemiyor.
                      </audio>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{clip.title}</h3>
                      <Badge variant="secondary">{categoryLabels[clip.category]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {new Date(clip.created_at).toLocaleDateString('tr-TR')}
                    </p>

                    {/* Like and Comment Buttons */}
                    <div className="flex items-center gap-4 mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(clip.id)}
                        className="flex items-center gap-2"
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{clipLikes.length}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowComments(prev => ({ ...prev, [clip.id]: !prev[clip.id] }))}
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{clipComments.length}</span>
                      </Button>
                    </div>

                    {/* Comments Section */}
                    {showComments[clip.id] && (
                      <div className="border-t border-border pt-4 mt-4">
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                          {clipComments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Henüz yorum yok</p>
                          ) : (
                            clipComments.map((comment) => (
                              <div key={comment.id} className="bg-muted/50 rounded p-3">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-sm flex-1">{comment.comment}</p>
                                  {canDeleteComment(comment) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Yorum yaz..."
                            value={newComment[clip.id] || ""}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [clip.id]: e.target.value }))}
                            className="min-h-[60px]"
                          />
                          <Button onClick={() => handleComment(clip.id)} size="sm">
                            Gönder
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clips;