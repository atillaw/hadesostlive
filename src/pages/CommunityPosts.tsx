import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUp, ArrowDown, MessageSquare, Plus, 
  TrendingUp, Clock, Pin, Lock, Flame
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  description_long: string | null;
  icon_url: string | null;
  theme_color: string;
  member_count: number;
  post_count: number;
}

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

const CommunityPosts = () => {
  const { slug } = useParams<{ slug: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    if (slug) {
      loadCommunity();
      loadPosts();
      loadUserVotes();
    }
  }, [slug, sortBy]);

  const loadUserVotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("votes")
      .select("post_id, vote_type")
      .eq("user_id", user.id)
      .not("post_id", "is", null);

    if (data) {
      const votesMap: Record<string, number> = {};
      data.forEach((vote) => {
        if (vote.post_id) votesMap[vote.post_id] = vote.vote_type;
      });
      setUserVotes(votesMap);
    }
  };

  const loadCommunity = async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .eq("slug", slug)
      .single();

    if (data) setCommunity(data);
  };

  const loadPosts = async () => {
    const communityData = await supabase
      .from("communities")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!communityData.data) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from("posts")
      .select("*")
      .eq("community_id", communityData.data.id)
      .eq("is_deleted", false);

    if (sortBy === "hot") {
      // Hot algorithm: score = upvotes - downvotes / (hours_since_creation + 2)^1.5
      const { data } = await query;
      if (data) {
        const rankedPosts = data
          .map((post) => {
            const score = post.upvotes - post.downvotes;
            const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
            const hotScore = score / Math.pow(hoursOld + 2, 1.5);
            return { ...post, hotScore };
          })
          .sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return b.hotScore - a.hotScore;
          });
        setPosts(rankedPosts);
      }
    } else if (sortBy === "top") {
      query = query.order("upvotes", { ascending: false });
      const { data } = await query;
      if (data) setPosts(data);
    } else {
      query = query.order("created_at", { ascending: false });
      const { data } = await query;
      if (data) setPosts(data);
    }

    setLoading(false);
  };

  const handleVote = async (postId: string, voteType: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Giriş gerekli",
        description: "Oy kullanmak için giriş yapmalısınız",
        variant: "destructive",
      });
      return;
    }

    const existingVote = userVotes[postId];

    if (existingVote === voteType) {
      // Remove vote
      await supabase
        .from("votes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      
      const newVotes = { ...userVotes };
      delete newVotes[postId];
      setUserVotes(newVotes);
    } else if (existingVote) {
      // Change vote
      await supabase
        .from("votes")
        .update({ vote_type: voteType })
        .eq("post_id", postId)
        .eq("user_id", user.id);
      
      setUserVotes({ ...userVotes, [postId]: voteType });
    } else {
      // New vote
      await supabase
        .from("votes")
        .insert({
          post_id: postId,
          user_id: user.id,
          vote_type: voteType,
        });
      
      setUserVotes({ ...userVotes, [postId]: voteType });
    }

    loadPosts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <Skeleton className="h-48 w-full mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Topluluk bulunamadı</p>
            <Button asChild className="mt-4">
              <Link to="/forum">Foruma Dön</Link>
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24 max-w-5xl">
        {/* Community Header */}
        <Card className="p-8 mb-6">
          <div className="flex items-start gap-6">
            <div
              className="text-6xl p-4 rounded-xl"
              style={{ backgroundColor: `${community.theme_color}20` }}
            >
              {community.icon_url || "📁"}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">c/{community.slug}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {community.description}
              </p>
              {community.description_long && (
                <p className="text-sm text-muted-foreground mb-4">
                  {community.description_long}
                </p>
              )}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{community.post_count.toLocaleString()} gönderi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{community.member_count.toLocaleString()} üye</span>
                </div>
              </div>
            </div>
            <Button asChild>
              <Link to={`/c/${slug}/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Gönderi
              </Link>
            </Button>
          </div>
        </Card>

        {/* Sort Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={sortBy === "hot" ? "default" : "ghost"}
            onClick={() => setSortBy("hot")}
          >
            <Flame className="h-4 w-4 mr-2" />
            Hot
          </Button>
          <Button
            variant={sortBy === "new" ? "default" : "ghost"}
            onClick={() => setSortBy("new")}
          >
            <Clock className="h-4 w-4 mr-2" />
            Yeni
          </Button>
          <Button
            variant={sortBy === "top" ? "default" : "ghost"}
            onClick={() => setSortBy("top")}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            En Çok Oylanan
          </Button>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.id} to={`/c/${slug}/post/${post.id}`}>
              <Card className="p-6 hover:border-primary transition-all cursor-pointer">
                <div className="flex gap-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-8 w-8 ${userVotes[post.id] === 1 ? 'text-orange-500' : ''}`}
                      onClick={(e) => handleVote(post.id, 1, e)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-sm">
                      {post.upvotes - post.downvotes}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-8 w-8 ${userVotes[post.id] === -1 ? 'text-blue-500' : ''}`}
                      onClick={(e) => handleVote(post.id, -1, e)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      {post.is_pinned && (
                        <Pin className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                      {post.is_locked && (
                        <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <h2 className="text-xl font-semibold hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Link 
                        to={`/u/${post.author_username}`}
                        className="hover:text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
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
                        <MessageSquare className="h-3 w-3" />
                        <span>{post.comment_count} yorum</span>
                      </div>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-3">
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
            </Link>
          ))}

          {posts.length === 0 && (
            <Card className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Henüz gönderi yok. İlk gönderiyi sen oluştur!
              </p>
              <Button asChild>
                <Link to={`/c/${slug}/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Gönderi
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CommunityPosts;
