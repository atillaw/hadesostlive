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
import { ArrowLeft, X, Upload, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
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
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleAddTag = () => {
    if (tagInput && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      
      if (!isUnder10MB) {
        toast({
          title: "Dosya çok büyük",
          description: "Dosya boyutu 10MB'dan küçük olmalı",
          variant: "destructive",
        });
        return false;
      }
      
      return isImage || isVideo;
    });
    
    setMediaFiles((prev) => [...prev, ...validFiles].slice(0, 4));
  };

  const handleRemoveFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const uploadMediaFiles = async () => {
    const uploadedUrls: string[] = [];
    
    for (const file of mediaFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("forum-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("forum-media")
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

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

      const { data: comm } = await supabase
        .from("communities")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!comm) {
        toast({
          title: "Hata",
          description: "Topluluk bulunamadı",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      // Upload media files if any
      let mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        mediaUrls = await uploadMediaFiles();
      }

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          community_id: comm.id,
          author_id: user.id,
          author_username: isAnonymous ? "Anonim" : (profile?.username || "Kullanıcı"),
          title,
          content,
          is_anonymous: isAnonymous,
          tags: tags.length > 0 ? tags : null,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Gönderin oluşturuldu",
      });

      navigate(`/c/${slug}/post/${post.id}`);
    } catch (error) {
      console.error("Gönderi oluşturulamadı:", error);
      toast({
        title: "Hata",
        description: "Gönderi oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/c/${slug}`}>
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

            <div className="space-y-2">
              <Label>Medya (opsiyonel, max 4 dosya, 10MB/dosya)</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="media-upload"
                  disabled={mediaFiles.length >= 4}
                />
                <label
                  htmlFor="media-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Resim veya video yüklemek için tıklayın
                  </p>
                </label>
              </div>
              
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative border rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="h-4 w-4" />
                        ) : (
                          <VideoIcon className="h-4 w-4" />
                        )}
                        <span className="text-xs truncate flex-1">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
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
              <Button type="submit" disabled={loading || uploading || !title || !content}>
                {uploading ? "Yükleniyor..." : loading ? "Gönderiliyor..." : "Gönder"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/c/${slug}`)}
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
