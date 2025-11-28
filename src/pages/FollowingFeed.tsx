import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown, MessageSquare, Bookmark, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Post {
  id: string;
  title: string;
  content: string;
  author_username: string;
  author_id: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  community_id: string;
  communities: {
    name: string;
    slug: string;
  };
}

export default function FollowingFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    await Promise.all([
      fetchFollowingPosts(user.id),
      fetchUserVotes(user.id),
      fetchSavedPosts(user.id),
    ]);
  };

  const fetchFollowingPosts = async (userId: string) => {
    setLoading(true);

    // Get list of users the current user follows
    const { data: followingData, error: followError } = await supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", userId);

    if (followError) {
      console.error("Error fetching following:", followError);
      setLoading(false);
      return;
    }

    if (!followingData || followingData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const followingIds = followingData.map(f => f.following_id);

    // Fetch posts from followed users
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        communities (
          name,
          slug
        )
      `)
      .in("author_id", followingIds)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Hata",
        description: "Gönderiler yüklenemedi",
        variant: "destructive",
      });
    } else {
      setPosts(data || []);
    }

    setLoading(false);
  };

  const fetchUserVotes = async (userId: string) => {
    const { data, error } = await supabase
      .from("votes")
      .select("post_id, vote_type")
      .eq("user_id", userId)
      .not("post_id", "is", null);

    if (error) {
      console.error("Error fetching user votes:", error);
      return;
    }

    const votesMap: Record<string, number> = {};
    data?.forEach((vote) => {
      if (vote.post_id) {
        votesMap[vote.post_id] = vote.vote_type;
      }
    });
    setUserVotes(votesMap);
  };

  const fetchSavedPosts = async (userId: string) => {
    const { data, error } = await supabase
      .from("saved_posts")
      .select("post_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching saved posts:", error);
      return;
    }

    setSavedPosts(new Set(data?.map(s => s.post_id) || []));
  };

  const handleVote = async (postId: string, voteType: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const currentVote = userVotes[postId];

    if (currentVote === voteType) {
      await supabase
        .from("votes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      setUserVotes(prev => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });
    } else {
      await supabase.from("votes").upsert({
        post_id: postId,
        user_id: user.id,
        vote_type: voteType,
      });

      setUserVotes(prev => ({ ...prev, [postId]: voteType }));
    }

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      fetchFollowingPosts(currentUser.id);
    }
  };

  const handleSavePost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    if (savedPosts.has(postId)) {
      await supabase
        .from("saved_posts")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      setSavedPosts(prev => {
        const updated = new Set(prev);
        updated.delete(postId);
        return updated;
      });

      toast({
        title: "Başarılı",
        description: "Gönderi kaydedilenlerden çıkarıldı",
      });
    } else {
      await supabase.from("saved_posts").insert({
        post_id: postId,
        user_id: user.id,
      });

      setSavedPosts(prev => new Set(prev).add(postId));

      toast({
        title: "Başarılı",
        description: "Gönderi kaydedildi",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p className="text-center">Yükleniyor...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="page-content">
        <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Takip Ettiğim Gönderiler</h1>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg text-muted-foreground mb-2">
                Henüz gönderi yok
              </p>
              <p className="text-sm text-muted-foreground">
                Takip ettiğiniz kullanıcıların gönderileri burada görünecek
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(post.id, 1)}
                        className={userVotes[post.id] === 1 ? "text-orange-500" : ""}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                      <span className="font-bold text-sm">
                        {post.upvotes - post.downvotes}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(post.id, -1)}
                        className={userVotes[post.id] === -1 ? "text-blue-500" : ""}
                      >
                        <ArrowDown className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-xs"
                          onClick={() => navigate(`/c/${post.communities.slug}`)}
                        >
                          c/{post.communities.slug}
                        </Button>
                        <span className="text-xs text-muted-foreground">•</span>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-xs text-muted-foreground"
                          onClick={() => navigate(`/kullanici/${post.author_username}`)}
                        >
                          u/{post.author_username}
                        </Button>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString("tr-TR")}
                        </span>
                      </div>

                      <h3
                        className="text-xl font-semibold mb-2 cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/c/${post.communities.slug}/${post.id}`)}
                      >
                        {post.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {post.content}
                      </p>

                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/c/${post.communities.slug}/${post.id}`)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {post.comment_count} Yorum
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSavePost(post.id)}
                          className={savedPosts.has(post.id) ? "text-primary" : ""}
                        >
                          <Bookmark
                            className="h-4 w-4 mr-2"
                            fill={savedPosts.has(post.id) ? "currentColor" : "none"}
                          />
                          {savedPosts.has(post.id) ? "Kaydedildi" : "Kaydet"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
      </div>
      <Footer />
    </div>
  );
}
