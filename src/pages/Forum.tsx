import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Eye, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  topic_count?: number;
  entry_count?: number;
  latest_topic?: {
    title: string;
    slug: string;
    created_at: string;
  };
}

const Forum = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Kategoriler yüklenemedi:", error);
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
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold glow-text mb-2">Forum</h1>
            <p className="text-muted-foreground">Konuları keşfedin, tartışmalara katılın</p>
          </div>
          <Button asChild>
            <Link to="/forum/new">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Konu
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {categories.map((category) => (
            <Link key={category.id} to={`/forum/c/${category.slug}`}>
              <Card className="p-6 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{category.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">{category.name}</h2>
                    <p className="text-muted-foreground mb-3">{category.description}</p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{category.topic_count || 0} Konu</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{category.entry_count || 0} Gönderi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Forum;
