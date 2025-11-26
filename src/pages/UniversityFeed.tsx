import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface University {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  member_count: number;
  post_count: number;
}

const UniversityFeed = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .eq("is_active", true)
        .order("post_count", { ascending: false });

      if (error) throw error;
      setUniversities(data || []);
    } catch (error) {
      console.error("Üniversiteler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold glow-text mb-2">Üniversite Forumları</h1>
          <p className="text-muted-foreground">Üniversiteni seç, tartışmalara katıl</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {universities.map((uni) => (
            <Link key={uni.id} to={`/u/${uni.slug}`}>
              <Card className="p-6 h-full hover:bg-accent/50 transition-all hover:scale-[1.02]">
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{uni.name}</h2>
                    {uni.city && (
                      <p className="text-sm text-muted-foreground">{uni.city}</p>
                    )}
                  </div>
                  
                  {uni.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {uni.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{uni.post_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{uni.member_count}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {universities.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Henüz üniversite yok</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UniversityFeed;
