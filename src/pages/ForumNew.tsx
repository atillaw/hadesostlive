import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ForumNew = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from("forum_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    
    setCategories(data || []);
    
    if (slug) {
      const category = data?.find(c => c.slug === slug);
      if (category) setSelectedCategory(category.id);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !selectedCategory) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let username = "Misafir";
      if (user && !isAnonymous) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        username = profile?.username || user.email?.split("@")[0] || "Kullanıcı";
      }

      const topicSlug = generateSlug(title);
      
      const { data: topic, error: topicError } = await supabase
        .from("forum_topics")
        .insert({
          category_id: selectedCategory,
          title,
          slug: topicSlug,
          author_id: user?.id || null,
          author_username: username,
          is_anonymous: isAnonymous || !user,
        })
        .select()
        .single();

      if (topicError) throw topicError;

      const { error: entryError } = await supabase
        .from("forum_entries")
        .insert({
          topic_id: topic.id,
          author_id: user?.id || null,
          author_username: username,
          is_anonymous: isAnonymous || !user,
          content,
        });

      if (entryError) throw entryError;

      toast({
        title: "Başarılı",
        description: "Konu oluşturuldu",
      });

      navigate(`/forum/t/${topicSlug}`);
    } catch (error) {
      console.error("Konu oluşturulamadı:", error);
      toast({
        title: "Hata",
        description: "Konu oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/forum">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Foruma Dön
          </Link>
        </Button>

        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Yeni Konu Oluştur</h1>

          <div className="space-y-6">
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                placeholder="Konunun başlığını yazın"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="content">İçerik</Label>
              <Textarea
                id="content"
                placeholder="İlk gönderinizi yazın..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <Label htmlFor="anonymous">Anonim gönder</Label>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                İptal
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Oluşturuluyor..." : "Konu Oluştur"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForumNew;
