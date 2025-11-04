import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageContentSection from "@/components/PageContentSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Heart, MessageSquare, Trash2, Video, Zap, Shield, Film } from "lucide-react";
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
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">Klipler</h1>
            <p className="text-muted-foreground">En iyi anlar yükleniyor...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card/50 backdrop-blur rounded-xl border border-border overflow-hidden">
                <div className="aspect-video skeleton" />
                <div className="p-6 space-y-4">
                  <div className="h-6 skeleton rounded w-3/4" />
                  <div className="h-4 skeleton rounded w-1/2" />
                  <div className="flex gap-4">
                    <div className="h-8 skeleton rounded w-20" />
                    <div className="h-8 skeleton rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12 animate-fade-in">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">Klipler</h1>
          <p className="text-muted-foreground text-base md:text-lg mb-6">
            En iyi oyun anları, komik videolar ve ses kayıtları
          </p>
          <Button 
            onClick={() => navigate("/klip-yukle")} 
            className="mb-8 hover:scale-105 transition-transform"
            size="lg"
          >
            <Upload className="mr-2 h-5 w-5" />
            Klip Yükle
          </Button>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 justify-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
              className="hover:scale-105 transition-transform"
            >
              Tümü
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                onClick={() => setSelectedCategory(key)}
                size="sm"
                className="hover:scale-105 transition-transform"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {filteredClips.length === 0 ? (
          <div className="text-center py-20 animate-scale-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-4">
              <Video className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-4">Henüz klip yüklenmemiş.</p>
            <Button onClick={() => navigate("/klip-yukle")}>
              <Upload className="mr-2 h-4 w-4" />
              İlk Klibi Sen Yükle!
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClips.map((clip, index) => {
              const fileUrl = getFileUrl(clip.file_path);
              const isVideo = clip.file_path.match(/\.(mp4|webm|mov)$/i);
              const clipLikes = likes[clip.id] || [];
              const clipComments = comments[clip.id] || [];
              const isLiked = isLikedByUser(clip.id);
              
              return (
                <div 
                  key={clip.id} 
                  className="group bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden card-glow animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="aspect-video bg-muted/50 flex items-center justify-center relative overflow-hidden">
                    {isVideo ? (
                      <video src={fileUrl} controls className="w-full h-full" preload="metadata">
                        Tarayıcınız video oynatmayı desteklemiyor.
                      </video>
                    ) : (
                      <div className="w-full p-6 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                        <audio src={fileUrl} controls className="w-full">
                          Tarayıcınız ses oynatmayı desteklemiyor.
                        </audio>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {clip.title}
                      </h3>
                      <Badge variant="secondary" className="shrink-0">{categoryLabels[clip.category]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(clip.created_at).toLocaleDateString('tr-TR')}
                    </p>

                    {/* Like and Comment Buttons */}
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        variant={isLiked ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLike(clip.id)}
                        className="flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{clipLikes.length}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowComments(prev => ({ ...prev, [clip.id]: !prev[clip.id] }))}
                        className="flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">{clipComments.length}</span>
                      </Button>
                    </div>

                    {/* Comments Section */}
                    {showComments[clip.id] && (
                      <div className="border-t border-border pt-4 mt-4 animate-slide-up">
                        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                          {clipComments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              İlk yorumu sen yap! 💬
                            </p>
                          ) : (
                            clipComments.map((comment) => (
                              <div key={comment.id} className="bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-sm flex-1">{comment.comment}</p>
                                  {canDeleteComment(comment) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Düşüncelerini paylaş..."
                            value={newComment[clip.id] || ""}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [clip.id]: e.target.value }))}
                            className="min-h-[70px] resize-none"
                          />
                          <Button 
                            onClick={() => handleComment(clip.id)} 
                            size="sm"
                            className="self-end"
                            disabled={!newComment[clip.id]?.trim()}
                          >
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
        
        <PageContentSection
          pageKey="clips"
          title="Klipler Hakkında"
          description="Topluluğun en iyi anlarını paylaşın ve keşfedin. Video ve ses kayıtlarınızı yükleyin, beğenin ve yorum yapın."
          features={[
            {
              icon: <Film className="h-8 w-8 text-primary" />,
              title: "Kolay Paylaşım",
              description: "Video ve ses dosyalarınızı kolayca yükleyin ve paylaşın"
            },
            {
              icon: <Zap className="h-8 w-8 text-primary" />,
              title: "Anında Yayın",
              description: "Onaylanan klipler hemen yayına girer"
            },
            {
              icon: <Shield className="h-8 w-8 text-primary" />,
              title: "Kalite Kontrol",
              description: "Tüm içerikler moderasyon sürecinden geçer"
            }
          ]}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Clips;