import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface VOD {
  id: string;
  title: string;
  thumbnail_url: string | null;
  video_url: string;
  average_rating: number;
  vote_count: number;
}

const VODSection = () => {
  const [vods, setVods] = useState<VOD[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});

  // Get user identifier (using localStorage for simplicity)
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
  }, []);

  const loadVODs = async () => {
    try {
      const { data, error } = await supabase
        .from("vod_stats")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setVods(data || []);
    } catch (error) {
      console.error("Error loading VODs:", error);
      toast({
        title: "Error",
        description: "Failed to load VODs",
        variant: "destructive",
      });
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

  const handleRate = async (vodId: string, rating: number) => {
    const userId = getUserIdentifier();

    try {
      const { error } = await supabase.from("vod_ratings").upsert(
        {
          vod_id: vodId,
          user_identifier: userId,
          rating,
        },
        {
          onConflict: "vod_id,user_identifier",
        }
      );

      if (error) throw error;

      setUserRatings({ ...userRatings, [vodId]: rating });
      toast({
        title: "Rating Submitted!",
        description: `You rated this VOD ${rating} stars.`,
      });

      // Reload VODs to update average ratings
      loadVODs();
    } catch (error) {
      console.error("Error rating VOD:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    }
  };

  const StarRating = ({ vodId, currentRating, averageRating }: { vodId: string; currentRating?: number; averageRating: number }) => {
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(vodId, star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={
                  star <= (hoveredStar ?? currentRating ?? 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }
              />
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {averageRating > 0 ? `${averageRating.toFixed(1)}` : "No ratings yet"}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">VODs & Highlights</h2>
            <p className="text-muted-foreground text-base md:text-lg">Geçmiş yayınları keşfet ve favori anları izle</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card/50 backdrop-blur rounded-xl border border-border overflow-hidden">
                <div className="aspect-video skeleton" />
                <div className="p-6 space-y-4">
                  <div className="h-6 skeleton rounded w-3/4" />
                  <div className="h-4 skeleton rounded w-1/2" />
                  <div className="h-10 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-background/50 animate-fade-in">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">VODs & Highlights</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Geçmiş yayınları keşfet ve favori anları izle
          </p>
        </div>

        {vods.length === 0 ? (
          <div className="text-center py-12 animate-scale-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-4">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-center text-muted-foreground text-lg">Henüz VOD yok. Yakında kontrol edin!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {vods.map((vod, index) => (
              <div
                key={vod.id}
                className="group bg-card/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden card-glow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {vod.thumbnail_url ? (
                  <div className="aspect-video bg-muted overflow-hidden relative">
                    <img
                      src={vod.thumbnail_url}
                      alt={vod.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted/50 flex items-center justify-center">
                    <svg className="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">{vod.title}</h3>
                  <StarRating
                    vodId={vod.id}
                    currentRating={userRatings[vod.id]}
                    averageRating={vod.average_rating}
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {vod.vote_count} oy
                    </span>
                  </div>
                  <a
                    href={vod.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn inline-flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-all hover:shadow-lg font-medium"
                  >
                    <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    VOD'u İzle
                  </a>
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
