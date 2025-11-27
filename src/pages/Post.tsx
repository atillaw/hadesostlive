import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUp, ArrowDown, MessageSquare, ArrowLeft, 
  Pin, Lock, Share2 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface Post {
  id: string;
  title: string;
  content: string;
  author_username: string;
  is_anonymous: boolean;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  tags: string[];
}

interface Comment {
  id: string;
  content: string;
  author_username: string;
  is_anonymous: boolean;
  upvotes: number;
  downvotes: number;
  created_at: string;
}

const Post = () => {
  const { slug, postId } = useParams<{ slug: string; postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
      incrementViewCount();
    }
  }, [postId]);

  const incrementViewCount = async () => {
    const { data: currentPost } = await supabase
      .from("posts")
      .select("view_count")
      .eq("id", postId)
      .single();
    
    if (currentPost) {
      await supabase
        .from("posts")
        .update({ view_count: currentPost.view_count + 1 })
        .eq("id", postId);
    }
  };

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error("Gönderi yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Yorumlar yüklenemedi:", error);
    }
  };

  const handleVote = async (voteType: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { data: existingVote } = await supabase
      .from("votes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        await supabase.from("votes").delete().eq("id", existingVote.id);
      } else {
        await supabase
          .from("votes")
          .update({ vote_type: voteType })
          .eq("id", existingVote.id);
      }
    } else {
      await supabase.from("votes").insert({
        post_id: postId,
        user_id: user.id,
        vote_type: voteType,
      });
    }

    loadPost();
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Giriş gerekli",
          description: "Yorum yapmak için giriş yapmalısınız",
          variant: "destructive",
        });
        window.location.href = "/auth";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: user.id,
        author_username: profile?.username || "Kullanıcı",
        content: newComment,
      });

      if (error) throw error;

      setNewComment("");
      loadComments();
      loadPost();
      toast({ title: "Yorum eklendi" });
    } catch (error) {
      console.error("Yorum eklenemedi:", error);
      toast({
        title: "Hata",
        description: "Yorum eklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link kopyalandı" });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-64 w-full mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Gönderi bulunamadı</p>
          <Button asChild className="mt-4">
            <Link to="/forum">Foruma Dön</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/c/${slug}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <div className="flex gap-4 p-6">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleVote(1)}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
              <span className="font-bold text-lg">
                {post.upvotes - post.downvotes}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleVote(-1)}
              >
                <ArrowDown className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-start gap-2 mb-3">
                {post.is_pinned && <Pin className="h-5 w-5 text-primary mt-1" />}
                {post.is_locked && <Lock className="h-5 w-5 text-muted-foreground mt-1" />}
                <h1 className="text-3xl font-bold">{post.title}</h1>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                <span>{post.is_anonymous ? "Anonim" : post.author_username}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comment_count} yorum</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="ml-auto"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Paylaş
                </Button>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-4">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {!post.is_locked && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Yorum Yap</h3>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Düşüncelerini paylaş..."
              rows={4}
              className="mb-4"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? "Gönderiliyor..." : "Yorum Yap"}
            </Button>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            {comments.length} Yorum
          </h3>
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-1 text-sm">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <span className="font-semibold text-xs">
                    {comment.upvotes - comment.downvotes}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="font-semibold">
                      {comment.is_anonymous ? "Anonim" : comment.author_username}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))}

          {comments.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Henüz yorum yok. İlk yorumu sen yap!
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
