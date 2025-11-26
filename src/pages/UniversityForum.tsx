import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUp, ArrowDown, MessageSquare, Plus, Pin, Lock, 
  TrendingUp, Clock, ArrowLeft 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

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

interface University {
  id: string;
  name: string;
  description: string | null;
}

const UniversityForum = () => {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"hot" | "new">("hot");

  useEffect(() => {
    if (slug) {
      loadUniversity();
      loadPosts();
    }
  }, [slug, sortBy]);

  const loadUniversity = async () => {
    const { data } = await supabase
      .from("universities")
      .select("id, name, description")
      .eq("slug", slug)
      .single();
    if (data) setUniversity(data);
  };

  const loadPosts = async () => {
    try {
      const { data: uni } = await supabase
        .from("universities")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!uni) return;

      let query = supabase
        .from("posts")
        .select("*")
        .eq("university_id", uni.id)
        .eq("is_approved", true)
        .eq("is_deleted", false);

      if (sortBy === "hot") {
        query = query.order("upvotes", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Gönderiler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, voteType: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Redirect to login
      window.location.href = "/auth";
      return;
    }

    // Check if already voted
    const { data: existingVote } = await supabase
      .from("votes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote
        await supabase.from("votes").delete().eq("id", existingVote.id);
      } else {
        // Change vote
        await supabase
          .from("votes")
          .update({ vote_type: voteType })
          .eq("id", existingVote.id);
      }
    } else {
      // New vote
      await supabase.from("votes").insert({
        post_id: postId,
        user_id: user.id,
        vote_type: voteType,
      });
    }

    loadPosts();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/forum">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold glow-text">{university?.name}</h1>
            {university?.description && (
              <p className="text-muted-foreground text-sm">{university.description}</p>
            )}
          </div>
          <Button asChild>
            <Link to={`/u/${slug}/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Gönderi Oluştur
            </Link>
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={sortBy === "hot" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("hot")}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Popüler
          </Button>
          <Button
            variant={sortBy === "new" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("new")}
          >
            <Clock className="h-4 w-4 mr-2" />
            Yeni
          </Button>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="flex gap-3 p-4">
                <div className="flex flex-col items-center gap-1 text-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleVote(post.id, 1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold">
                    {post.upvotes - post.downvotes}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleVote(post.id, -1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <Link to={`/u/${slug}/post/${post.id}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {post.is_pinned && (
                        <Pin className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      )}
                      {post.is_locked && (
                        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      )}
                      <h2 className="text-lg font-semibold hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                    </div>
                  </Link>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>
                      {post.is_anonymous ? "Anonim" : post.author_username}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{post.comment_count} yorum</span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex gap-1">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {posts.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Henüz gönderi yok</p>
              <Button asChild>
                <Link to={`/u/${slug}/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk gönderiyi sen oluştur
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversityForum;
