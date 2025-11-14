import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VODTag {
  id: string;
  name: string;
  created_at: string;
}

interface VODWithTags {
  id: string;
  title: string;
  tags: VODTag[];
}

const AdminVODTags = () => {
  const [tags, setTags] = useState<VODTag[]>([]);
  const [vods, setVods] = useState<VODWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load tags
      const { data: tagsData, error: tagsError } = await supabase
        .from("vod_tags")
        .select("*")
        .order("name");

      if (tagsError) throw tagsError;
      setTags(tagsData || []);

      // Load VODs with their tags
      const { data: vodsData, error: vodsError } = await supabase
        .from("vods")
        .select(`
          id,
          title,
          vod_tag_mappings (
            vod_tags (
              id,
              name,
              created_at
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (vodsError) throw vodsError;

      // Transform the data
      const vodsWithTags = vodsData?.map(vod => ({
        id: vod.id,
        title: vod.title,
        tags: vod.vod_tag_mappings
          ?.map((mapping: any) => mapping.vod_tags)
          .filter(Boolean) || []
      })) || [];

      setVods(vodsWithTags);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Hata",
        description: "Veriler yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Hata",
        description: "Etiket adı gerekli",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("vod_tags").insert({
        name: newTagName.trim(),
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Etiket oluşturuldu",
      });

      setNewTagName("");
      loadData();
    } catch (error) {
      console.error("Error creating tag:", error);
      toast({
        title: "Hata",
        description: "Etiket oluşturulamadı",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Bu etiketi silmek istediğinizden emin misiniz? Tüm VOD'lardan kaldırılacak.")) return;

    try {
      const { error } = await supabase.from("vod_tags").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Etiket silindi",
      });

      loadData();
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast({
        title: "Hata",
        description: "Etiket silinemedi",
        variant: "destructive",
      });
    }
  };

  const handleAddTagToVOD = async (vodId: string, tagId: string) => {
    try {
      const { error } = await supabase.from("vod_tag_mappings").insert({
        vod_id: vodId,
        tag_id: tagId,
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Etiket VOD'a eklendi",
      });

      loadData();
    } catch (error) {
      console.error("Error adding tag to VOD:", error);
      toast({
        title: "Hata",
        description: "Etiket eklenemedi",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTagFromVOD = async (vodId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from("vod_tag_mappings")
        .delete()
        .eq("vod_id", vodId)
        .eq("tag_id", tagId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Etiket VOD'dan kaldırıldı",
      });

      loadData();
    } catch (error) {
      console.error("Error removing tag from VOD:", error);
      toast({
        title: "Hata",
        description: "Etiket kaldırılamadı",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">VOD Etiketleri Yönetimi</h2>
        <p className="text-muted-foreground">VOD'lar için etiketler oluşturun ve yönetin</p>
      </div>

      {/* Create New Tag */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Yeni Etiket Oluştur</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="tag-name" className="sr-only">Etiket Adı</Label>
            <Input
              id="tag-name"
              placeholder="örn: FPS, RPG, Horror..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
            />
          </div>
          <Button onClick={handleCreateTag}>
            <Plus className="w-4 h-4 mr-2" />
            Oluştur
          </Button>
        </div>
      </Card>

      {/* All Tags */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tüm Etiketler ({tags.length})</h3>
        {tags.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Henüz etiket oluşturulmamış
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="font-medium">{tag.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* VODs with Tags */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">VOD'lar ve Etiketleri</h3>
        {vods.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Henüz VOD yok
          </Card>
        ) : (
          <div className="space-y-3">
            {vods.map((vod) => (
              <Card key={vod.id} className="p-6">
                <h4 className="font-semibold mb-3">{vod.title}</h4>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {vod.tags.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Etiket yok</span>
                    ) : (
                      vod.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive/20"
                          onClick={() => handleRemoveTagFromVOD(vod.id, tag.id)}
                        >
                          {tag.name}
                          <Trash2 className="w-3 h-3 ml-2" />
                        </Badge>
                      ))
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags
                      .filter(tag => !vod.tags.some(vt => vt.id === tag.id))
                      .map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => handleAddTagToVOD(vod.id, tag.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {tag.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVODTags;
