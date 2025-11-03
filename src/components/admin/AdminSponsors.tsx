import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Sponsor {
  id: string;
  name: string;
  description: string | null;
  logo_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const AdminSponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error("Sponsor yükleme hatası:", error);
      toast.error("Sponsorlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("sponsor-logos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("sponsor-logos")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleAddSponsor = async () => {
    if (!name || !logoFile) {
      toast.error("Lütfen sponsor adı ve logo seçin");
      return;
    }

    setUploading(true);
    try {
      const logoUrl = await handleLogoUpload(logoFile);

      const { error } = await supabase.from("sponsors").insert({
        name,
        description,
        logo_url: logoUrl,
        display_order: displayOrder,
        is_active: true,
      });

      if (error) throw error;

      toast.success("Sponsor eklendi");
      setName("");
      setDescription("");
      setDisplayOrder(0);
      setLogoFile(null);
      fetchSponsors();
    } catch (error) {
      console.error("Sponsor ekleme hatası:", error);
      toast.error("Sponsor eklenemedi");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("sponsors")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success("Sponsor durumu güncellendi");
      fetchSponsors();
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
      toast.error("Durum güncellenemedi");
    }
  };

  const handleDelete = async (id: string, logoUrl: string) => {
    if (!confirm("Bu sponsoru silmek istediğinize emin misiniz?")) return;

    try {
      // Delete from storage
      const path = logoUrl.split("/sponsor-logos/")[1];
      if (path) {
        await supabase.storage.from("sponsor-logos").remove([path]);
      }

      // Delete from database
      const { error } = await supabase.from("sponsors").delete().eq("id", id);

      if (error) throw error;

      toast.success("Sponsor silindi");
      fetchSponsors();
    } catch (error) {
      console.error("Sponsor silme hatası:", error);
      toast.error("Sponsor silinemedi");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle>Yeni Sponsor Ekle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Sponsor Adı</Label>
            <Input
              placeholder="Sponsor adı"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>Açıklama</Label>
            <Textarea
              placeholder="Sponsor açıklaması (opsiyonel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label>Sıralama</Label>
            <Input
              type="number"
              placeholder="Görüntülenme sırası"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Logo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button
            onClick={handleAddSponsor}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Sponsor Ekle
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle>Mevcut Sponsorlar ({sponsors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex items-center gap-4 p-4 border border-border rounded-lg bg-background/50"
              >
                <img
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  className="w-20 h-20 object-contain rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{sponsor.name}</h3>
                  {sponsor.description && (
                    <p className="text-sm text-muted-foreground">
                      {sponsor.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Sıra: {sponsor.display_order}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(sponsor.id, sponsor.is_active)}
                  >
                    {sponsor.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(sponsor.id, sponsor.logo_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {sponsors.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Henüz sponsor eklenmemiş
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSponsors;
