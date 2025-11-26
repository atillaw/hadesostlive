import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CreatePost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Giriş gerekli",
          description: "Gönderi oluşturmak için giriş yapmalısınız",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data: uni } = await supabase
        .from("universities")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!uni) {
        toast({
          title: "Hata",
          description: "Üniversite bulunamadı",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          university_id: uni.id,
          author_id: user.id,
          author_username: isAnonymous ? "Anonim" : (profile?.username || "Kullanıcı"),
          title,
          content,
          is_anonymous: isAnonymous,
          tags: tags.length > 0 ? tags : null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Gönderin oluşturuldu",
      });

      navigate(`/u/${slug}/post/${post.id}`);
    } catch (error) {
      console.error("Gönderi oluşturulamadı:", error);
      toast({
        title: "Hata",
        description: "Gönderi oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/u/${slug}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Yeni Gönderi</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="İlgi çekici bir başlık yazın"
                required
                maxLength={300}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">İçerik *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Düşüncelerinizi paylaşın..."
                required
                rows={10}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Etiketler (opsiyonel, max 5)</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Etiket ekle"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  disabled={tags.length >= 5}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput || tags.length >= 5}
                >
                  Ekle
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <Label htmlFor="anonymous" className="cursor-pointer">
                Anonim olarak gönder
              </Label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading || !title || !content}>
                {loading ? "Gönderiliyor..." : "Gönder"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/u/${slug}`)}
              >
                İptal
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreatePost;
