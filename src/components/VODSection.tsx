import { useState, useEffect } from "react";
import { Star, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import VODSearchFilters from "@/components/VODSearchFilters";

interface VOD {
  id: string;
  title: string;
  thumbnail_url: string | null;
  video_url: string;
  average_rating: number;
  vote_count: number;
  category: string;
  created_at: string;
  duration?: number;
  tags?: Array<{ id: string; name: string }>;
}

interface WatchProgress {
  vod_id: string;
  last_position: number;
  watch_duration: number;
}

const VODSection = () => {
  const [vods, setVods] = useState<VOD[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>({});
  const [filters, setFilters] = useState({
    search: "",
    tags: [] as string[],
    minDuration: 0,
    maxDuration: 240 * 60,
    sortBy: "latest",
  });

  const getUserIdentifier = () => {
    let userId = localStorage.getItem("vod_user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("vod_user_id", userId);
    }
    return userId;
  };

  useEffect(() => {
    loadVODs();
    loadUserRatings();
    loadWatchProgress();
  }, [filters]);

  const loadVODs = async () => {
    try {
      setLoading(true);
      let query = supabase.from("vods").select(`
        *,
        vod_tag_mappings (
          vod_tags (
            id,
            name
          )
        )
      `);

      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      if (filters.tags.length > 0) {
        const { data: taggedVods } = await supabase
          .from("vod_tag_mappings")
          .select("vod_id")
          .in("tag_id", filters.tags);
        
        if (taggedVods && taggedVods.length > 0) {
          const vodIds = taggedVods.map(t => t.vod_id);
          query = query.in("id", vodIds);
        }
      }

      if (filters.minDuration > 0 || filters.maxDuration < 240 * 60) {
        query = query.gte("duration", filters.minDuration).lte("duration", filters.maxDuration);
      }

      if (filters.sortBy === "latest") {
        query = query.order("created_at", { ascending: false });
      }

      query = query.limit(20);

      const { data, error } = await query;
      if (error) throw error;

      // Transform data to include tags
      const vodsWithTags = data?.map((vod: any) => ({
        ...vod,
        tags: vod.vod_tag_mappings?.map((mapping: any) => mapping.vod_tags).filter(Boolean) || []
      })) || [];

      // Get ratings
      const { data: ratingsData } = await supabase
        .from("vod_ratings")
        .select("vod_id, rating")
        .in("vod_id", vodsWithTags.map(v => v.id));

      const vodRatings: Record<string, { total: number; count: number }> = {};
      ratingsData?.forEach((r: any) => {
        if (!vodRatings[r.vod_id]) vodRatings[r.vod_id] = { total: 0, count: 0 };
        vodRatings[r.vod_id].total += r.rating;
        vodRatings[r.vod_id].count += 1;
      });

      const vodsWithRatings = vodsWithTags.map(vod => ({
        ...vod,
        average_rating: vodRatings[vod.id] ? vodRatings[vod.id].total / vodRatings[vod.id].count : 0,
        vote_count: vodRatings[vod.id]?.count || 0
      }));

      setVods(vodsWithRatings);
    } catch (error) {
      console.error("Error loading VODs:", error);
      toast({ title: "Hata", description: "VOD'lar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadUserRatings = async () => {
    try {
      const userId = getUserIdentifier();
      const { data, error } = await supabase
        .from("vod_ratings")
        .select("vod_id, rating")
        .eq("user_identifier", userId);

      if (error) throw error;
      const ratings: Record<string, number> = {};
      data?.forEach((rating) => {
        ratings[rating.vod_id] = rating.rating;
      });
      setUserRatings(ratings);
    } catch (error) {
      console.error("Error loading user ratings:", error);
    }
  };

  const loadWatchProgress = async () => {
    try {
      const userId = getUserIdentifier();
      const { data, error } = await supabase
        .from("vod_views")
        .select("vod_id, last_position, watch_duration")
        .eq("user_identifier", userId)
        .gt("last_position", 0);

      if (error) throw error;
      const progress: Record<string, WatchProgress> = {};
      data?.forEach((view) => {
        progress[view.vod_id] = view;
      });
      setWatchProgress(progress);
    } catch (error) {
      console.error("Error loading watch progress:", error);
    }
  };

  const saveWatchProgress = async (vodId: string, position: number, duration: number) => {
    const userId = getUserIdentifier();
    try {
      await supabase.from("vod_views").upsert(
        {
          vod_id: vodId,
          user_identifier: userId,
          last_position: position,
          watch_duration: duration,
          completed: position >= duration * 0.9,
        },
        { onConflict: "vod_id,user_identifier" }
      );
    } catch (error) {
      console.error("Error saving watch progress:", error);
    }
  };

  const handleRate = async (vodId: string, rating: number) => {
    const userId = getUserIdentifier();
    try {
      const { error } = await supabase.from("vod_ratings").upsert(
        { vod_id: vodId, user_identifier: userId, rating: rating },
        { onConflict: "vod_id,user_identifier" }
      );
      if (error) throw error;
      setUserRatings((prev) => ({ ...prev, [vodId]: rating }));
      await loadVODs();
      await supabase.from("vod_views").insert({
        vod_id: vodId,
        user_identifier: userId,
        watch_duration: 0,
        completed: false,
      });
      toast({ title: "Teşekkürler!", description: "Puanınız kaydedildi" });
    } catch (error) {
      console.error("Error rating VOD:", error);
      toast({ title: "Hata", description: "Puan kaydedilemedi", variant: "destructive" });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}s ${minutes}dk` : `${minutes}dk`;
  };

  return (
    <section className="py-16 md:py-24 container mx-auto px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            VOD Arşivi
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Geçmiş yayınları izle ve favorilerini bul!
          </p>
        </div>

        <VODSearchFilters onFiltersChange={setFilters} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-card/50 rounded-xl border border-border/50 overflow-hidden">
                <div className="aspect-video bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : vods.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Aradığınız kriterlere uygun VOD bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
            {vods.map((vod) => (
              <div key={vod.id} className="group relative overflow-hidden rounded-xl border border-primary/20 card-glow bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300">
                <a href={vod.video_url} target="_blank" rel="noopener noreferrer" className="block aspect-video relative overflow-hidden">
                  {vod.thumbnail_url ? (
                    <img src={vod.thumbnail_url} alt={vod.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                      <span className="text-muted-foreground">No thumbnail</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {vod.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatDuration(vod.duration)}
                    </div>
                  )}
                  {watchProgress[vod.id] && (
                    <div className="absolute bottom-2 left-2 bg-green-600/90 px-2 py-1 rounded text-xs font-medium">
                      Kaldığın yer: {formatDuration(watchProgress[vod.id].last_position)}
                    </div>
                  )}
                </a>
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">{vod.title}</h3>
                  <div className="flex flex-wrap gap-1">
                    {vod.category && (
                      <Badge variant="outline" className="text-xs">{vod.category}</Badge>
                    )}
                    {vod.tags?.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => handleRate(vod.id, star)} className="transition-all hover:scale-125">
                          <Star className={`w-4 h-4 ${star <= (userRatings[vod.id] || 0) ? "fill-primary text-primary" : star <= (vod.average_rating || 0) ? "fill-primary/30 text-primary/30" : "fill-none text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {vod.vote_count > 0 ? `${vod.average_rating?.toFixed(1)} (${vod.vote_count})` : "Puansız"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VODSection;
