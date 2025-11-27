import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

const CommunityFeed = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .eq("is_active", true)
      .order("member_count", { ascending: false });

    if (data) setCommunities(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <h1 className="text-4xl font-bold glow-text mb-2">Topluluklar</h1>
          <p className="text-muted-foreground">
            İlgi alanlarına göre topluluklara katıl, tartışmalara katıl
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((community) => (
            <Link key={community.id} to={`/c/${community.slug}`}>
              <Card className="p-6 hover:border-primary transition-all hover:shadow-lg cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div
                    className="text-4xl p-3 rounded-xl"
                    style={{ backgroundColor: `${community.theme_color}20` }}
                  >
                    {community.icon_url || "📁"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold mb-1 truncate">
                      c/{community.slug}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {community.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{community.member_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{community.post_count.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {communities.length === 0 && (
          <Card className="p-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Henüz topluluk yok</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;
