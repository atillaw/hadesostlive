import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AdminManualVODs = () => {
  const [videoUrls, setVideoUrls] = useState("");
  const [loading, setLoading] = useState(false);

  const extractUuid = (url: string): string | null => {
    const match = url.match(/\/videos\/([a-f0-9-]+)/);
    return match ? match[1] : null;
  };

  const handleAddVODs = async () => {
    if (!videoUrls.trim()) {
      toast.error("Lütfen en az bir VOD URL'si girin");
      return;
    }

    setLoading(true);

    try {
      const urls = videoUrls.split('\n').filter(url => url.trim());
      const uuids = urls.map(extractUuid).filter(Boolean) as string[];

      if (uuids.length === 0) {
        toast.error("Geçerli VOD URL'si bulunamadı");
        return;
      }

      // Fetch metadata from Kick API
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'fetch-kick-vod-metadata',
        { body: { videoUuids: uuids } }
      );

      if (functionError) throw functionError;

      if (!functionData?.success || !functionData?.vods) {
        throw new Error("VOD metadata alınamadı");
      }

      // Insert VODs into database
      const vodsToInsert = functionData.vods.map((vod: any) => ({
        title: vod.title,
        video_url: vod.video_url,
        thumbnail_url: vod.thumbnail,
      }));

      const { error: insertError } = await supabase
        .from('vods')
        .insert(vodsToInsert);

      if (insertError) throw insertError;

      toast.success(`${vodsToInsert.length} VOD başarıyla eklendi`);
      setVideoUrls("");
    } catch (error) {
      console.error('Error adding VODs:', error);
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
          <Label htmlFor="video-urls">VOD URL'leri (Her satıra bir URL)</Label>
          <textarea
            id="video-urls"
            value={videoUrls}
            onChange={(e) => setVideoUrls(e.target.value)}
            placeholder="https://kick.com/hadesost/videos/..."
            className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background"
            rows={5}
          />
          <p className="text-sm text-muted-foreground">
            Örnek: https://kick.com/hadesost/videos/580472d1-cf4f-4ecd-b272-580fe41cd49a
          </p>
        </div>
        
        <Button 
          onClick={handleAddVODs} 
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
