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
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center glow-text">VODs & Highlights</h2>
          <p className="text-center text-muted-foreground">Loading VODs...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-background/50">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center glow-text">VODs & Highlights</h2>

        {vods.length === 0 ? (
          <p className="text-center text-muted-foreground">No VODs available yet. Check back soon!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vods.map((vod) => (
              <div
                key={vod.id}
                className="bg-card/50 backdrop-blur rounded-lg border border-border overflow-hidden card-glow transition-all hover:scale-105"
              >
                {vod.thumbnail_url ? (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={vod.thumbnail_url}
                      alt={vod.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No thumbnail available</p>
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-lg">{vod.title}</h3>
                  <StarRating
                    vodId={vod.id}
                    currentRating={userRatings[vod.id]}
                    averageRating={vod.average_rating}
                  />
                  <p className="text-sm text-muted-foreground">{vod.vote_count} votes</p>
                  <a
                    href={vod.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Watch VOD
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
