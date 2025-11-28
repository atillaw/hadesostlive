import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUp, ArrowDown, MessageSquare, ArrowLeft, 
  Pin, Lock, Share2, User, Clock, Bookmark
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import PostModerationTools from "@/components/PostModerationTools";

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
  media_urls: string[] | null;
}

interface Comment {
  id: string;
  content: string;
  author_username: string;
  is_anonymous: boolean;
  upvotes: number;
  downvotes: number;
  parent_comment_id: string | null;
  created_at: string;
  replies?: Comment[];
}

const Post = () => {
  const { slug, postId } = useParams<{ slug: string; postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [userCommentVotes, setUserCommentVotes] = useState<Record<string, number>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
      incrementViewCount();
      loadUserVotes();
      checkIfSaved();
      
      // Realtime subscription for post updates
      const postChannel = supabase
        .channel(`post-${postId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "posts",
            filter: `id=eq.${postId}`,
          },
          () => {
            loadPost();
          }
        )
        .subscribe();

      // Realtime subscription for comments
      const commentsChannel = supabase
        .channel(`comments-${postId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "comments",
            filter: `post_id=eq.${postId}`,
          },
          () => {
            loadComments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(postChannel);
        supabase.removeChannel(commentsChannel);
      };
    }
  }, [postId]);

  const loadUserVotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load post vote
    const { data: postVote } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (postVote) setUserVote(postVote.vote_type);

    // Load comment votes
    const { data: commentVotes } = await supabase
      .from("votes")
      .select("comment_id, vote_type")
      .eq("user_id", user.id)
      .not("comment_id", "is", null);

    if (commentVotes) {
      const votesMap: Record<string, number> = {};
      commentVotes.forEach((vote) => {
        if (vote.comment_id) votesMap[vote.comment_id] = vote.vote_type;
      });
      setUserCommentVotes(votesMap);
    }
  };

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
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Organize into tree
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      (data || []).forEach((comment) => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      commentMap.forEach((comment) => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error("Yorumlar yüklenemedi:", error);
    }
  };

  const checkIfSaved = async () => {
    if (!postId) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("saved_posts")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    setIsSaved(!!data);
  };

  const handleVote = async (voteType: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Giriş gerekli",
        description: "Oy kullanmak için giriş yapmalısınız",
        variant: "destructive",
      });
      return;
    }

    if (userVote === voteType) {
      // Remove vote
      await supabase
        .from("votes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      setUserVote(null);
    } else if (userVote) {
      // Change vote
      await supabase
        .from("votes")
        .update({ vote_type: voteType })
        .eq("post_id", postId)
        .eq("user_id", user.id);
      setUserVote(voteType);
    } else {
      // New vote
      await supabase.from("votes").insert({
        post_id: postId,
        user_id: user.id,
        vote_type: voteType,
      });
      setUserVote(voteType);
    }
  };

  const handleCommentVote = async (commentId: string, voteType: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Giriş gerekli",
        description: "Oy kullanmak için giriş yapmalısınız",
        variant: "destructive",
      });
      return;
    }

    const existingVote = userCommentVotes[commentId];

    if (existingVote === voteType) {
      await supabase
        .from("votes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);
      const newVotes = { ...userCommentVotes };
      delete newVotes[commentId];
      setUserCommentVotes(newVotes);
    } else if (existingVote) {
      await supabase
        .from("votes")
        .update({ vote_type: voteType })
        .eq("comment_id", commentId)
        .eq("user_id", user.id);
      setUserCommentVotes({ ...userCommentVotes, [commentId]: voteType });
    } else {
      await supabase.from("votes").insert({
        comment_id: commentId,
        user_id: user.id,
        vote_type: voteType,
      });
      setUserCommentVotes({ ...userCommentVotes, [commentId]: voteType });
    }
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

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Cevap yazmak için giriş yapmalısınız", variant: "destructive" });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      parent_comment_id: parentId,
      content: replyContent,
      author_username: profile?.username || "anonymous",
      author_id: user.id,
    });

    if (error) {
      toast({ title: "Cevap eklenemedi", variant: "destructive" });
      return;
    }

    setReplyContent("");
    setReplyingTo(null);
    loadComments();
    toast({ title: "Cevap eklendi!" });
  };

  const toggleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Kaydetmek için giriş yapmalısınız", variant: "destructive" });
      return;
    }

    if (isSaved) {
      const { error } = await supabase
        .from("saved_posts")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Kayıt kaldırılamadı", variant: "destructive" });
        return;
      }

      setIsSaved(false);
      toast({ title: "Post kaydedilmekten çıkarıldı" });
    } else {
      const { error } = await supabase
        .from("saved_posts")
        .insert({ post_id: postId, user_id: user.id });

      if (error) {
        toast({ title: "Post kaydedilemedi", variant: "destructive" });
        return;
      }

      setIsSaved(true);
      toast({ title: "Post kaydedildi!" });
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
                className={userVote === 1 ? "text-orange-500" : ""}
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
                className={userVote === -1 ? "text-blue-500" : ""}
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
                <Link 
                  to={`/u/${post.author_username}`}
                  className="hover:text-primary hover:underline"
                >
                  {post.is_anonymous ? "Anonim" : post.author_username}
                </Link>
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
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSave}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-primary text-primary" : ""}`} />
                    {isSaved ? "Kaydedildi" : "Kaydet"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Paylaş
                  </Button>
                  <PostModerationTools
                    postId={post.id}
                    isPinned={post.is_pinned}
                    isLocked={post.is_locked}
                    authorUsername={post.author_username}
                    onUpdate={loadPost}
                  />
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-4">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>

              {post.media_urls && post.media_urls.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {post.media_urls.map((url, idx) => {
                    const isVideo = url.includes(".mp4") || url.includes(".webm") || url.includes(".mov");
                    return (
                      <div key={idx} className="relative rounded-lg overflow-hidden">
                        {isVideo ? (
                          <video
                            src={url}
                            controls
                            className="w-full h-auto"
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`Media ${idx + 1}`}
                            className="w-full h-auto object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

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
            <CommentItem
              key={comment.id}
              comment={comment}
              userCommentVotes={userCommentVotes}
              handleCommentVote={handleCommentVote}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleReplySubmit={handleReplySubmit}
              depth={0}
            />
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

interface CommentItemProps {
  comment: Comment;
  userCommentVotes: Record<string, number>;
  handleCommentVote: (commentId: string, voteType: number) => void;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleReplySubmit: (parentId: string) => void;
  depth: number;
}

const CommentItem = ({
  comment,
  userCommentVotes,
  handleCommentVote,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleReplySubmit,
  depth,
}: CommentItemProps) => {
  const maxDepth = 5;
  const marginLeft = Math.min(depth * 2, maxDepth * 2);

  return (
    <div style={{ marginLeft: `${marginLeft}rem` }}>
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCommentVote(comment.id, 1)}
                className={userCommentVotes[comment.id] === 1 ? "text-primary" : ""}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {comment.upvotes - comment.downvotes}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCommentVote(comment.id, -1)}
                className={userCommentVotes[comment.id] === -1 ? "text-destructive" : ""}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <User className="h-4 w-4" />
                <span className="font-medium">u/{comment.author_username}</span>
                <span>•</span>
                <Clock className="h-4 w-4" />
                <span>{new Date(comment.created_at).toLocaleString("tr-TR")}</span>
              </div>
              <p className="text-foreground whitespace-pre-wrap mb-2">{comment.content}</p>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Cevapla
              </Button>

              {replyingTo === comment.id && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Cevabınızı yazın..."
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleReplySubmit(comment.id)} size="sm">
                      Gönder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                    >
                      İptal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              userCommentVotes={userCommentVotes}
              handleCommentVote={handleCommentVote}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleReplySubmit={handleReplySubmit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;
