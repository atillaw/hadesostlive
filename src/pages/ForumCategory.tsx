import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye, Plus, Pin, Lock, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface Topic {
  id: string;
  title: string;
  slug: string;
  author_username: string;
  is_anonymous: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  entry_count: number;
  last_entry_at: string;
  created_at: string;
}

const ForumCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadCategory();
      loadTopics();
    }
  }, [slug]);

  const loadCategory = async () => {
    const { data } = await supabase
      .from("forum_categories")
      .select("name")
      .eq("slug", slug)
      .single();
    if (data) setCategoryName(data.name);
  };

  const loadTopics = async () => {
    try {
      const { data: category } = await supabase
        .from("forum_categories")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!category) return;

      const { data, error } = await supabase
        .from("forum_topics")
        .select("*")
        .eq("category_id", category.id)
        .eq("is_deleted", false)
        .order("is_pinned", { ascending: false })
        .order("last_entry_at", { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error("Konular yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/forum">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold glow-text mb-2">{categoryName}</h1>
            <p className="text-muted-foreground">{topics.length} konu</p>
          </div>
          <Button asChild>
            <Link to={`/forum/c/${slug}/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Konu
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {topics.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Henüz konu yok. İlk konuyu siz açın!</p>
            </Card>
          ) : (
            topics.map((topic) => (
              <Link key={topic.id} to={`/forum/t/${topic.slug}`}>
                <Card className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {topic.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                        {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                        <h2 className="text-xl font-semibold">{topic.title}</h2>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {topic.is_anonymous ? "Anonim" : topic.author_username}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(topic.created_at), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{topic.entry_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{topic.view_count}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumCategory;
