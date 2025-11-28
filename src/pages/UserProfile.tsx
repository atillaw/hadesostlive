import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, MessageSquare, Calendar, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import UserProfileEnhanced from "@/components/UserProfileEnhanced";

interface Profile {
  username: string;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  community_id: string;
  communities: {
    slug: string;
    name: string;
  };
}

interface Comment {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  post_id: string;
  posts: {
    id: string;
    title: string;
    community_id: string;
  };
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [karma, setKarma] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username, created_at")
        .eq("username", username)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Get user's posts
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          id, title, content, upvotes, downvotes, comment_count, created_at, community_id,
          communities (slug, name)
        `)
        .eq("author_username", username)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      setPosts(postsData || []);

      // Get user's comments
      const { data: commentsData } = await supabase
        .from("comments")
        .select(`
          id, content, upvotes, downvotes, created_at, post_id,
          posts (id, title, community_id)
        `)
        .eq("author_username", username)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      setComments(commentsData || []);

      // Calculate karma
      const postKarma = (postsData || []).reduce(
        (sum, post) => sum + (post.upvotes - post.downvotes),
        0
      );
      const commentKarma = (commentsData || []).reduce(
        (sum, comment) => sum + (comment.upvotes - comment.downvotes),
        0
      );
      setKarma(postKarma + commentKarma);
    } catch (error) {
      console.error("Profil yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl mt-20">
          <Skeleton className="h-48 w-full mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl mt-20">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Kullanıcı bulunamadı</p>
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
      <div className="page-content">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">u/{profile.username}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Katıldı:{" "}
                    {formatDistanceToNow(new Date(profile.created_at), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold text-primary">{karma}</span>
              </div>
              <p className="text-sm text-muted-foreground">Karma</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Gönderi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{comments.length}</p>
              <p className="text-sm text-muted-foreground">Yorum</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {posts.reduce((sum, p) => sum + p.comment_count, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Alınan Yorum</p>
            </div>
          </div>
        </Card>

        {/* Enhanced Profile Section */}
          <UserProfileEnhanced
            profileId={username}
            karma={karma}
            postsCount={posts.length}
            commentsCount={comments.length}
            joinedDate={profile.created_at}
          />

        {/* Posts and Comments Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">
              Gönderiler ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-1">
              Yorumlar ({comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4 mt-6">
            {posts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Henüz gönderi yok</p>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="p-6 hover:border-primary/50 transition-colors">
                  <Link to={`/c/${post.communities.slug}/post/${post.id}`}>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1 text-sm">
                        <ArrowUp className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">
                          {post.upvotes - post.downvotes}
                        </span>
                        <ArrowDown className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{post.communities.name}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 mb-3">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comment_count} yorum</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-6">
            {comments.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Henüz yorum yok</p>
              </Card>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="p-6 hover:border-primary/50 transition-colors">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 text-sm">
                      <ArrowUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold">
                        {comment.upvotes - comment.downvotes}
                      </span>
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">
                          Şu gönderiye yorum:
                        </span>
                        <Link
                          to={`/c/${comment.posts.community_id}/post/${comment.post_id}`}
                          className="text-sm font-medium hover:text-primary transition-colors"
                        >
                          {comment.posts.title}
                        </Link>
                      </div>
                      <p className="whitespace-pre-wrap mb-2">{comment.content}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;
