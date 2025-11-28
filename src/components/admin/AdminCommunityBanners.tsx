import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, Eye, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Community {
  id: string;
  name: string;
  slug: string;
  banner_url: string | null;
}

export const AdminCommunityBanners = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunities();
  }, []);

  useEffect(() => {
    if (selectedCommunityId) {
      const community = communities.find(c => c.id === selectedCommunityId);
      setPreviewUrl(community?.banner_url || null);
    }
  }, [selectedCommunityId, communities]);

  const loadCommunities = async () => {
    const { data } = await supabase
      .from("communities")
      .select("id, name, slug, banner_url")
      .order("name");

    if (data) setCommunities(data);
    setLoading(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!selectedCommunityId) {
        toast.error("Lütfen bir topluluk seçin");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Lütfen bir resim dosyası seçin");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Resim boyutu 5MB'dan küçük olmalı");
        return;
      }

      setUploading(true);

      const community = communities.find(c => c.id === selectedCommunityId);
      const fileExt = file.name.split(".").pop();
      const fileName = `${community?.slug}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("community-banners")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("community-banners")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("communities")
        .update({ banner_url: publicUrl })
        .eq("id", selectedCommunityId);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      loadCommunities();
      toast.success("Banner başarıyla yüklendi");
    } catch (error: any) {
      console.error("Banner upload error:", error);
      toast.error(error.message || "Banner yüklenirken hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!selectedCommunityId) return;

    try {
      const { error } = await supabase
        .from("communities")
        .update({ banner_url: null })
        .eq("id", selectedCommunityId);

      if (error) throw error;

      setPreviewUrl(null);
      loadCommunities();
      toast.success("Banner kaldırıldı");
    } catch (error: any) {
      console.error("Remove banner error:", error);
      toast.error("Banner kaldırılırken hata oluştu");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Banner Yönetimi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Topluluk Seçin</Label>
          <Select value={selectedCommunityId} onValueChange={setSelectedCommunityId}>
            <SelectTrigger>
              <SelectValue placeholder="Bir topluluk seçin" />
            </SelectTrigger>
            <SelectContent>
              {communities.map((community) => (
                <SelectItem key={community.id} value={community.id}>
                  {community.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCommunityId && (
          <>
            <div className="space-y-2">
              <Label>Banner Önizleme</Label>
              <div className="border rounded-lg overflow-hidden bg-muted">
                {previewUrl ? (
                  <div className="relative aspect-[3/1] w-full">
                    <img
                      src={previewUrl}
                      alt="Banner önizleme"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(previewUrl, "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleRemoveBanner}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/1] flex items-center justify-center">
                    <p className="text-muted-foreground">Banner yüklenmemiş</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-upload">Yeni Banner Yükle</Label>
              <div className="flex gap-2">
                <Input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="flex-1"
                />
                <Button disabled={uploading}>
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Önerilen boyut: 1200x400px (3:1 oran). Max 5MB
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};