import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TeamApplicationSection = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    instagram: "",
    discord: "",
    age: "",
    city: "",
    talent: "",
    reason: "",
    recipientEmail: "hadesostbusiness@gmail.com", // Default, can be changed
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.age || !formData.city || !formData.talent || !formData.reason) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-team-application", {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Başvuru Gönderildi!",
        description: "Takım başvurunuz başarıyla gönderildi.",
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        instagram: "",
        discord: "",
        age: "",
        city: "",
        talent: "",
        reason: "",
        recipientEmail: formData.recipientEmail,
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Gönderim Başarısız",
        description: "Başvurunuz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="team" className="py-20 px-4 scroll-mt-20">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-4xl font-bold mb-4 text-center glow-text">Takımımıza Katılmak İster misin?</h2>
        <p className="text-muted-foreground text-center mb-8">
          Buna hazır olduğunu mu düşünüyorsun? HadesOST ekibine katılmak için başvur!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card/50 backdrop-blur p-8 rounded-lg border border-border card-glow">
          <div className="space-y-2">
            <Label htmlFor="fullName">İsim Soyisim *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Adınız ve soyadınız"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ornek@email.com"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="@kullaniciadi"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discord">Discord</Label>
            <Input
              id="discord"
              value={formData.discord}
              onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
              placeholder="kullaniciadi#1234"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Yaş *</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Yaşınız"
              required
              min="1"
              max="120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Şehir *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Şehriniz"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="talent">Yetenek / Beceri *</Label>
            <Input
              id="talent"
              value={formData.talent}
              onChange={(e) => setFormData({ ...formData, talent: e.target.value })}
              placeholder="Örn: Oyun stratejisi, Video düzenleme, Topluluk yönetimi"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Ekibimize katılmak istemenizin nedeni nedir? *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Ekip için neden harika bir seçim olacağınızı bize anlatın..."
              required
              maxLength={1000}
              rows={6}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default TeamApplicationSection;
