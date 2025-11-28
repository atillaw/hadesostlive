import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, MessageSquare, Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import CustomAdUnit from "@/components/CustomAdUnit";
import AdSenseUnit from "@/components/AdSenseUnit";

interface Post {
  id: string;
  title: string;
  content: string;
  author_username: string;
  is_anonymous: boolean;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  community_id: string;
  tags: string[] | null;
}

interface Community {
  slug: string;
}

const SavedPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    loadSavedPosts();
    loadUserVotes();
  }, []);

  const loadSavedPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: savedData } = await supabase
      .from("saved_posts")
      .select("post_id")
      .eq("user_id", user.id);

    if (savedData && savedData.length > 0) {
      const postIds = savedData.map(s => s.post_id);
      
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .in("id", postIds)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (postsData) setPosts(postsData);
    }

    setLoading(false);
  };

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

    loadSavedPosts();
  };

  const unsavePost = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("saved_posts")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    setPosts(posts.filter(p => p.id !== postId));
    toast.success("Post kaydedilenlerden çıkarıldı");
  };

  const getPostCommunitySlug = async (communityId: string) => {
    const { data } = await supabase
      .from("communities")
      .select("slug")
      .eq("id", communityId)
      .single();
    
    return data?.slug || "";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-6">Kaydettiğim Gönderiler</h1>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Henüz kaydettiğiniz gönderi yok
                </p>
                <Button asChild>
                  <Link to="/forum">Foruma Git</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userVotes={userVotes}
                    handleVote={handleVote}
                    unsavePost={unsavePost}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-bold mb-2">Kayıtlı Gönderiler</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Daha sonra okumak için kaydettiğiniz gönderileri buradan görüntüleyebilirsiniz.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-2">Sponsorlu</div>
                <CustomAdUnit />
              </CardContent>
            </Card>

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

interface PostCardProps {
  post: Post;
  userVotes: Record<string, number>;
  handleVote: (postId: string, voteType: number, e: React.MouseEvent) => void;
  unsavePost: (postId: string, e: React.MouseEvent) => void;
}

const PostCard = ({ post, userVotes, handleVote, unsavePost }: PostCardProps) => {
  const [communitySlug, setCommunitySlug] = useState("");

  useEffect(() => {
    if (post.community_id) {
      supabase
        .from("communities")
        .select("slug")
        .eq("id", post.community_id)
        .single()
        .then(({ data }) => {
          if (data) setCommunitySlug(data.slug);
        });
    }
  }, [post.community_id]);

  return (
    <div className="bg-card rounded-lg border hover:border-primary/50 transition-colors">
      <div className="flex">
        <div className="flex flex-col items-center gap-1 bg-muted/30 p-2 rounded-l-lg">
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${userVotes[post.id] === 1 ? "text-orange-500" : ""}`}
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
            className={`h-6 w-6 ${userVotes[post.id] === -1 ? "text-blue-500" : ""}`}
            onClick={(e) => handleVote(post.id, -1, e)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            {communitySlug && (
              <>
                <Link
                  to={`/c/${communitySlug}`}
                  className="hover:underline font-medium"
                >
                  c/{communitySlug}
                </Link>
                <span>•</span>
              </>
            )}
            <Link
              to={`/u/${post.author_username}`}
              className="hover:underline"
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

          <Link
            to={communitySlug ? `/c/${communitySlug}/post/${post.id}` : "#"}
            className="text-lg font-semibold hover:text-primary transition-colors block mb-2"
          >
            {post.title}
          </Link>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {post.content}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Link
              to={communitySlug ? `/c/${communitySlug}/post/${post.id}` : "#"}
              className="flex items-center gap-1 hover:text-primary"
            >
              <MessageSquare className="h-3 w-3" />
              {post.comment_count}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 gap-1"
              onClick={(e) => unsavePost(post.id, e)}
            >
              <Bookmark className="h-3 w-3 fill-current" />
              Kayıttan Çıkar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedPosts;
