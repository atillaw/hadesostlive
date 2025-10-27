import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video } from "lucide-react";

const UploadClip = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"gameplay" | "funny" | "music" | "other">("other");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Lütfen geçerli bir video veya ses dosyası seçin (MP4, WebM, MOV, MP3, WAV, OGG)");
      return;
    }

    // Validate file size (50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("Dosya boyutu 50MB'dan küçük olmalıdır");
      return;
    }

    setFile(selectedFile);
    
    // Create preview for video
    if (selectedFile.type.startsWith('video/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !file) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('clips')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database entry
      const { error: dbError } = await supabase
        .from('clips')
        .insert({
          title: title.trim(),
          file_path: filePath,
          category: category,
          status: 'pending',
          user_identifier: `user-${Date.now()}`,
        });

      if (dbError) throw dbError;

      toast.success("Klip başarıyla yüklendi! Admin onayı bekleniyor.");
      navigate("/klipler");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Yükleme başarısız: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 glow-text">Klip Yükle</h1>
            <p className="text-muted-foreground">
              En iyi oyun anlarınızı, komik videolarınızı veya ses kayıtlarınızı paylaşın
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-6">
            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                placeholder="Klibinize bir başlık verin"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gameplay">🎮 Oyun Anları</SelectItem>
                  <SelectItem value="funny">😂 Komik</SelectItem>
                  <SelectItem value="music">🎵 Müzik</SelectItem>
                  <SelectItem value="other">📁 Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Dosya (Video veya Ses) *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Input
                  id="file"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/webm,audio/ogg"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <Label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-2">
                  {preview ? (
                    <video src={preview} controls className="max-h-48 rounded" />
                  ) : (
                    <>
                      <Video className="w-12 h-12 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {file ? file.name : "Video veya ses dosyası seçmek için tıklayın"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Maksimum 50MB - MP4, WebM, MOV, MP3, WAV, OGG
                      </span>
                    </>
                  )}
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Yükleniyor..." : "Yükle"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadClip;