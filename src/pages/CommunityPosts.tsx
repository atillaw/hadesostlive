import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowUp, ArrowDown, MessageSquare, 
  Pin, Lock, Bookmark
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import CustomAdUnit from "@/components/CustomAdUnit";
import AdSenseUnit from "@/components/AdSenseUnit";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  member_count: number;
  post_count: number;
  icon_url?: string | null;
  rules?: any;
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
  tags: string[] | null;
  media_urls: string[] | null;
}

const CommunityPosts = () => {
  const { slug } = useParams<{ slug: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  useEffect(() => {
    if (slug) {
      loadCommunity();
      loadPosts();
      loadUserVotes();
      loadSavedPosts();
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

  const loadSavedPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("saved_posts")
      .select("post_id")
      .eq("user_id", user.id);

    if (data) {
      setSavedPosts(data.map(s => s.post_id));
    }
  };

  const toggleSave = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Kaydetmek için giriş yapmalısınız");
      return;
    }

    const isSaved = savedPosts.includes(postId);

    if (isSaved) {
      await supabase.from("saved_posts").delete().eq("post_id", postId).eq("user_id", user.id);
      setSavedPosts(prev => prev.filter(id => id !== postId));
      toast.success("Kayıt kaldırıldı");
    } else {
      await supabase.from("saved_posts").insert({ post_id: postId, user_id: user.id });
      setSavedPosts(prev => [...prev, postId]);
      toast.success("Kaydedildi!");
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
      toast.error("Oy kullanmak için giriş yapmalısınız");
      return;
    }

    const existingVote = userVotes[postId];

    if (existingVote === voteType) {
      await supabase
        .from("votes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      
      const newVotes = { ...userVotes };
      delete newVotes[postId];
      setUserVotes(newVotes);
    } else if (existingVote) {
      await supabase
        .from("votes")
        .update({ vote_type: voteType })
        .eq("post_id", postId)
        .eq("user_id", user.id);
      
      setUserVotes({ ...userVotes, [postId]: voteType });
    } else {
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

  if (loading || !community) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Skeleton className="h-64 w-full mb-8" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Sort Tabs */}
            <div className="flex gap-2 bg-card rounded-lg p-2 border">
              <Button
                variant={sortBy === "hot" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("hot")}
              >
                🔥 Hot
              </Button>
              <Button
                variant={sortBy === "new" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("new")}
              >
                ⚡ Yeni
              </Button>
              <Button
                variant={sortBy === "top" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("top")}
              >
                🏆 Top
              </Button>
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Henüz gönderi yok. İlk gönderiyi siz oluşturun!
                </p>
                <Button asChild>
                  <Link to={`/c/${slug}/create`}>Gönderi Oluştur</Link>
                </Button>
              </Card>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-card rounded-lg border hover:border-primary/50 transition-colors">
                  <div className="flex">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-1 bg-muted/30 p-2 rounded-l-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${
                          userVotes[post.id] === 1 ? "text-orange-500" : ""
                        }`}
                        onClick={(e) => handleVote(post.id, 1, e)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span className="text-xs font-bold">
                        {post.upvotes - post.downvotes}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${
                          userVotes[post.id] === -1 ? "text-blue-500" : ""
                        }`}
                        onClick={(e) => handleVote(post.id, -1, e)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Link
                          to={`/u/${post.author_username}`}
                          className="hover:underline font-medium"
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
                      </div>

                      <div className="flex items-start gap-2 mb-2">
                        {post.is_pinned && (
                          <Pin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        )}
                        {post.is_locked && (
                          <Lock className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        )}
                        <Link
                          to={`/c/${slug}/post/${post.id}`}
                          className="text-lg font-semibold hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {post.content}
                      </p>

                      {post.media_urls && post.media_urls.length > 0 && (
                        <div className="flex gap-2 mb-2">
                          {post.media_urls.slice(0, 2).map((url, idx) => {
                            const isVideo = url.includes(".mp4") || url.includes(".webm") || url.includes(".mov");
                            return (
                              <div key={idx} className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                                {isVideo ? (
                                  <video src={url} className="w-full h-full object-cover" />
                                ) : (
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                            );
                          })}
                          {post.media_urls.length > 2 && (
                            <div className="w-16 h-16 rounded bg-muted/50 flex items-center justify-center text-xs">
                              +{post.media_urls.length - 2}
                            </div>
                          )}
                        </div>
                      )}

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1 mb-2 flex-wrap">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Link
                          to={`/c/${slug}/post/${post.id}`}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <MessageSquare className="h-3 w-3" />
                          {post.comment_count}
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 gap-1"
                          onClick={(e) => toggleSave(post.id, e)}
                        >
                          <Bookmark
                            className={`h-3 w-3 ${
                              savedPosts.includes(post.id) ? "fill-current" : ""
                            }`}
                          />
                          Kaydet
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Community Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {community.icon_url && (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-muted">
                      {community.icon_url}
                    </div>
                  )}
                  <h2 className="font-bold text-lg">{community.name}</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {community.description}
                </p>
                <div className="flex gap-4 text-sm mb-4">
                  <div>
                    <div className="font-bold">{community.member_count}</div>
                    <div className="text-muted-foreground text-xs">Üye</div>
                  </div>
                  <div>
                    <div className="font-bold">{community.post_count}</div>
                    <div className="text-muted-foreground text-xs">Gönderi</div>
                  </div>
                </div>
                <Button asChild className="w-full" size="sm">
                  <Link to={`/c/${slug}/create`}>Gönderi Oluştur</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Community Rules */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-3">📋 Topluluk Kuralları</h3>
                {community.rules && Array.isArray(community.rules) && community.rules.length > 0 ? (
                  <ol className="space-y-2 text-sm">
                    {(community.rules as any[]).map((rule: any, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span className="font-bold text-primary">{idx + 1}.</span>
                        <div>
                          <div className="font-medium">{rule.title || rule}</div>
                          {rule.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {rule.description}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Bu topluluk için henüz kural belirlenmemiş.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Ad Space 1 */}
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-2">Sponsorlu</div>
                <CustomAdUnit />
              </CardContent>
            </Card>

            {/* Ad Space 2 */}
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-2">Reklam</div>
                <AdSenseUnit />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CommunityPosts;
