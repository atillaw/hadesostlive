import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SnowEffect from "@/components/SnowEffect";
import StreamSection from "@/components/StreamSection";
import AboutSection from "@/components/AboutSection";
import YouTubeSection from "@/components/YouTubeSection";
import EmailSubscribeSection from "@/components/EmailSubscribeSection";
import VODSection from "@/components/VODSection";
import KickLiveListener from "@/components/KickLiveListener";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import ErrorBoundary from "@/components/ErrorBoundary";
import StreamMiniGames from "@/components/StreamMiniGames";
import SupportContentSection from "@/components/SupportContentSection";
import HolidayBanner from "@/components/HolidayBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowUp, MessageSquare, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface TrendingPost {
  id: string;
  title: string;
  community_id: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  author_username: string;
  communities: {
    name: string;
    slug: string;
  } | null;
}

const Index = () => {
  const [snowEnabled, setSnowEnabled] = useState(() => {
    const saved = localStorage.getItem('winter-theme');
    return saved !== null ? saved === 'true' : true;
  });
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('winter-theme', snowEnabled.toString());
  }, [snowEnabled]);

  useEffect(() => {
    loadTrendingPosts();
  }, []);

  const loadTrendingPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          community_id,
          upvotes,
          downvotes,
          comment_count,
          created_at,
          author_username,
          communities (
            name,
            slug
          )
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const postsWithScore = (data || []).map((post) => {
        const score = post.upvotes - post.downvotes;
        const hoursAgo = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
        const hotScore = score / Math.pow(hoursAgo + 2, 1.5);
        return { ...post, hotScore };
      });

      const trending = postsWithScore
        .sort((a, b) => b.hotScore - a.hotScore)
        .slice(0, 5);

      setTrendingPosts(trending);
    } catch (error) {
      console.error('Error loading trending posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'az önce';
    if (diffHours < 24) return `${diffHours} saat önce`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} gün önce`;
    return `${Math.floor(diffDays / 7)} hafta önce`;
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>HadesOST - Canlı Yayın ve Gaming İçerikleri</title>
        <meta name="description" content="HadesOST'un resmi web sitesi. Canlı yayınlar, VOD arşivi, klipler, topluluk özellikleri ve daha fazlası. En iyi gaming içeriklerini keşfedin." />
        <meta property="og:title" content="HadesOST - Canlı Yayın ve Gaming İçerikleri" />
        <meta property="og:description" content="HadesOST'un resmi web sitesi. Canlı yayınlar, VOD arşivi, klipler ve topluluk özellikleri." />
        <meta name="twitter:title" content="HadesOST - Canlı Yayın ve Gaming İçerikleri" />
        <meta name="twitter:description" content="HadesOST'un resmi web sitesi. Canlı yayınlar, VOD arşivi, klipler ve topluluk özellikleri." />
      </Helmet>
      <ErrorBoundary fallback={null}>
        <SnowEffect enabled={snowEnabled} />
      </ErrorBoundary>
      <HolidayBanner />
      <Navigation onSnowToggle={() => setSnowEnabled(!snowEnabled)} snowEnabled={snowEnabled} />
      <HeroSection />

      {/* Trend Posts Section */}
      <ErrorBoundary>
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trend Gönderiler
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : trendingPosts.length > 0 ? (
                <div className="space-y-3">
                  {trendingPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={post.communities?.slug ? `/c/${post.communities.slug}/post/${post.id}` : `/post/${post.id}`}
                      className="block p-4 rounded-lg bg-background/50 hover:bg-background/80 border border-border/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 min-w-[40px]">
                          <ArrowUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            {post.upvotes - post.downvotes}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {post.communities && (
                              <>
                                <Link
                                  to={`/c/${post.communities.slug}`}
                                  className="hover:text-primary transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  c/{post.communities.name}
                                </Link>
                                <span>•</span>
                              </>
                            )}
                            <span>u/{post.author_username}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(post.created_at)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.comment_count} yorum
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Henüz trend gönderi yok
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </ErrorBoundary>

      <StreamSection />
      <div className="container mx-auto px-4 py-12">
        <StreamMiniGames />
      </div>
      <AboutSection />
      <VODSection />
      <EmailSubscribeSection />
      <YouTubeSection />
      <SupportContentSection />
      <Footer />
      <ErrorBoundary fallback={null}>
        <KickLiveListener />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <AIChatWidget />
      </ErrorBoundary>
    </div>
  );
};

export default Index;
