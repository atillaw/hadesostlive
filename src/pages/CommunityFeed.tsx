import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import CustomAdUnit from "@/components/CustomAdUnit";
import AdSenseUnit from "@/components/AdSenseUnit";
import { Search, SlidersHorizontal } from "lucide-react";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  member_count: number;
  post_count: number;
  icon_url: string | null;
}

const CommunityFeed = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"members" | "posts" | "name">("members");

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    filterAndSortCommunities();
  }, [communities, searchQuery, sortBy]);

  const loadCommunities = async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .eq("is_active", true);

    if (data) setCommunities(data);
    setLoading(false);
  };

  const filterAndSortCommunities = () => {
    let filtered = [...communities];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "members") return b.member_count - a.member_count;
      if (sortBy === "posts") return b.post_count - a.post_count;
      if (sortBy === "name") return a.name.localeCompare(b.name, "tr");
      return 0;
    });

    setFilteredCommunities(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-6">Topluluklar</h1>
            
            {/* Search and Filter */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Topluluk ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sırala" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="members">Üye Sayısı</SelectItem>
                    <SelectItem value="posts">Gönderi Sayısı</SelectItem>
                    <SelectItem value="name">İsme Göre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : filteredCommunities.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "Arama sonucu bulunamadı" : "Henüz topluluk yok"}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredCommunities.map((community) => (
                  <Link
                    key={community.id}
                    to={`/c/${community.slug}`}
                    className="block"
                  >
                    <div className="bg-card rounded-lg border hover:border-primary/50 transition-colors p-4">
                      <div className="flex items-center gap-4">
                        {community.icon_url && (
                          <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-3xl bg-muted">
                            {community.icon_url}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-bold mb-1">{community.name}</h2>
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {community.description}
                          </p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>{community.member_count} üye</span>
                            <span>•</span>
                            <span>{community.post_count} gönderi</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-bold mb-2">Forum Hakkında</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Topluluklara katılın, gönderi paylaşın ve diğer üyelerle etkileşime geçin.
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

export default CommunityFeed;
