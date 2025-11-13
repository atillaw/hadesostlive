import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, X, Filter, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VODSearchFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    tags: string[];
    minDuration?: number;
    maxDuration?: number;
    sortBy: string;
  }) => void;
}

interface Tag {
  id: string;
  name: string;
}

const VODSearchFilters = ({ onFiltersChange }: VODSearchFiltersProps) => {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 240]); // 0-4 hours in minutes
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({
        search,
        tags: selectedTags,
        minDuration: durationRange[0] * 60, // convert to seconds
        maxDuration: durationRange[1] * 60,
        sortBy,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedTags, durationRange, sortBy]);

  const loadTags = async () => {
    const { data } = await supabase.from("vod_tags").select("*").order("name");
    if (data) setAvailableTags(data);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTags([]);
    setDurationRange([0, 240]);
    setSortBy("latest");
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}s ${mins}dk` : `${mins}dk`;
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="VOD ara (başlık, açıklama...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 transition-all"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "bg-primary/10 border-primary/50" : ""}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtrele
        </Button>
        {(search || selectedTags.length > 0 || durationRange[0] > 0 || durationRange[1] < 240) && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Temizle
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-md border border-border/30 rounded-xl p-6 space-y-6 animate-fade-in">
          {/* Tags */}
          <div>
            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span>Etiketler</span>
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedTags.length} seçili
                </Badge>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
              {availableTags.length === 0 && (
                <p className="text-sm text-muted-foreground">Henüz etiket yok</p>
              )}
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Video Süresi
            </label>
            <div className="space-y-3">
              <Slider
                value={durationRange}
                onValueChange={(value) => setDurationRange(value as [number, number])}
                min={0}
                max={240}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatDuration(durationRange[0])}</span>
                <span>{formatDuration(durationRange[1])}</span>
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Sıralama</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-card/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">En Yeni</SelectItem>
                <SelectItem value="popular">En Popüler</SelectItem>
                <SelectItem value="rating">En Yüksek Puan</SelectItem>
                <SelectItem value="most-watched">En Çok İzlenen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default VODSearchFilters;
