import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AdminManualVODs = () => {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddVOD = async () => {
    if (!title.trim() || !videoUrl.trim()) {
      toast.error("Başlık ve video URL'si zorunludur");
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('vods')
        .insert({
          title: title.trim(),
          video_url: videoUrl.trim(),
          thumbnail_url: thumbnailUrl.trim() || null,
        });

      if (insertError) throw insertError;

      toast.success("VOD başarıyla eklendi");
      setTitle("");
      setVideoUrl("");
      setThumbnailUrl("");
    } catch (error) {
      console.error('Error adding VOD:', error);
      toast.error("VOD eklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manuel VOD Ekle</CardTitle>
        <CardDescription>
          Kick VOD URL'lerini girerek manuel olarak VOD ekleyin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Yayın İsmi</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Epic Gameplay - Part 1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video-url">Video URL</Label>
          <Input
            id="video-url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://kick.com/hadesost/videos/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail-url">Thumbnail URL (Opsiyonel)</Label>
          <Input
            id="thumbnail-url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        
        <Button 
          onClick={handleAddVOD} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ekleniyor...
            </>
          ) : (
            "VOD Ekle"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminManualVODs;
