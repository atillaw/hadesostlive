import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";

const adSenseSchema = z.object({
  client: z.string().trim()
    .min(1, { message: "Client ID boş olamaz" })
    .regex(/^ca-pub-\d{16}$/, { message: "Geçerli bir AdSense Client ID giriniz (ca-pub-xxxxxxxxxxxxxxxx)" }),
  slot: z.string().trim()
    .min(1, { message: "Slot ID boş olamaz" })
    .regex(/^\d{10}$/, { message: "Geçerli bir AdSense Slot ID giriniz (10 haneli sayı)" }),
});

const AdminAdSense = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState("");
  const [slot, setSlot] = useState("");
  const [customHtml, setCustomHtml] = useState("");
  const [savingHtml, setSavingHtml] = useState(false);
  const [errors, setErrors] = useState<{ client?: string; slot?: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadAdSenseSettings();
  }, []);

  const loadAdSenseSettings = async () => {
    try {
      const { data: adSenseData, error: adSenseError } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "adsense")
        .maybeSingle();

      if (adSenseError) throw adSenseError;

      if (adSenseData?.value) {
        const settings = adSenseData.value as { client: string; slot: string };
        setClient(settings.client || "");
        setSlot(settings.slot || "");
      }

      const { data: htmlData, error: htmlError } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "custom_ad_html")
        .maybeSingle();

      if (htmlError) throw htmlError;

      if (htmlData?.value) {
        setCustomHtml((htmlData.value as { html: string }).html || "");
      }
    } catch (error: any) {
      console.error("Reklam ayarları yüklenemedi:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Reklam ayarları yüklenemedi",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setErrors({});
    
    // Validate input
    const validation = adSenseSchema.safeParse({ client, slot });
    
    if (!validation.success) {
      const fieldErrors: { client?: string; slot?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "client") fieldErrors.client = err.message;
        if (err.path[0] === "slot") fieldErrors.slot = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: "adsense",
          value: { client: validation.data.client, slot: validation.data.slot },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "key"
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "AdSense ayarları kaydedildi",
      });
    } catch (error: any) {
      console.error("AdSense ayarları kaydedilemedi:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "AdSense ayarları kaydedilemedi",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHtml = async () => {
    setSavingHtml(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: "custom_ad_html",
          value: { html: customHtml },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "key"
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Özel reklam HTML kodu kaydedildi",
      });
    } catch (error: any) {
      console.error("HTML kod kaydedilemedi:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "HTML kod kaydedilemedi",
      });
    } finally {
      setSavingHtml(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="glow-text">Google AdSense Ayarları</CardTitle>
          <CardDescription>
            Destek sayfasında görüntülenecek AdSense reklam birimini yapılandırın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              AdSense hesabınızdan Client ID ve Slot ID bilgilerinizi alabilirsiniz.
              <br />
              <a 
                href="https://www.google.com/adsense" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                AdSense Dashboard →
              </a>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">AdSense Client ID</Label>
              <Input
                id="client"
                placeholder="ca-pub-1234567890123456"
                value={client}
                onChange={(e) => {
                  setClient(e.target.value);
                  if (errors.client) setErrors({ ...errors, client: undefined });
                }}
                className={errors.client ? "border-destructive" : ""}
                maxLength={23}
              />
              {errors.client && (
                <p className="text-sm text-destructive">{errors.client}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Format: ca-pub-xxxxxxxxxxxxxxxx (16 haneli sayı)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slot">AdSense Slot ID</Label>
              <Input
                id="slot"
                placeholder="1234567890"
                value={slot}
                onChange={(e) => {
                  setSlot(e.target.value);
                  if (errors.slot) setErrors({ ...errors, slot: undefined });
                }}
                className={errors.slot ? "border-destructive" : ""}
                maxLength={10}
              />
              {errors.slot && (
                <p className="text-sm text-destructive">{errors.slot}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Format: 10 haneli sayı
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !client || !slot}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="glow-text">Özel Reklam HTML Kodu</CardTitle>
          <CardDescription>
            Destek sayfasında görüntülenecek özel reklam HTML kodunu ekleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Reklam ağlarından aldığınız HTML kodunu buraya yapıştırabilirsiniz.
              <br />
              Kod olduğu gibi sayfada görüntülenecektir.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customHtml">HTML Reklam Kodu</Label>
              <Textarea
                id="customHtml"
                placeholder='<div>Reklam HTML kodunuzu buraya yapıştırın...</div>'
                value={customHtml}
                onChange={(e) => setCustomHtml(e.target.value)}
                className="font-mono text-sm min-h-[200px]"
                maxLength={10000}
              />
              <p className="text-xs text-muted-foreground">
                Maksimum 10,000 karakter
              </p>
            </div>

            <Button
              onClick={handleSaveHtml}
              disabled={savingHtml}
              className="w-full sm:w-auto"
            >
              {savingHtml ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  HTML Kodunu Kaydet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAdSense;
