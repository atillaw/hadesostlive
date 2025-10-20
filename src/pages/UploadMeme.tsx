import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";

const UploadMeme = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Lütfen geçerli bir resim dosyası seçin (JPG, PNG, GIF, WEBP)");
      return;
    }

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Lütfen bir başlık girin");
      return;
    }

    if (!file) {
      toast.error("Lütfen bir resim seçin");
      return;
    }

    setUploading(true);

    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('memes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get user identifier (anonymous identifier)
      const userIdentifier = localStorage.getItem('user_identifier') || 
        `anon_${Math.random().toString(36).substring(2)}`;
      localStorage.setItem('user_identifier', userIdentifier);

      // Create database entry
      const { error: dbError } = await supabase
        .from('meme_uploads')
        .insert({
          title: title.trim(),
          image_path: filePath,
          user_identifier: userIdentifier,
          status: 'pending'
        });

      if (dbError) throw dbError;

      toast.success("Meme başarıyla yüklendi! Admin onayından sonra yayınlanacak.");
      setTitle("");
      setFile(null);
      setPreview(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Yükleme sırasında bir hata oluştu: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Ana Sayfaya Dön
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Meme Yükle
            </CardTitle>
            <CardDescription>
              Komik resimlerinizi paylaşın! Admin onayından sonra yayınlanacak.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Meme'iniz için bir başlık girin"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {title.length}/100 karakter
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Resim Seç *</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Desteklenen formatlar: JPG, PNG, GIF, WEBP (Maks. 5MB)
                </p>
              </div>

              {preview && (
                <div className="space-y-2">
                  <Label>Önizleme</Label>
                  <div className="rounded-lg border overflow-hidden">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={uploading}
              >
                {uploading ? "Yükleniyor..." : "Yükle"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadMeme;
