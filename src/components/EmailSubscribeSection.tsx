import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EmailSubscribeSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Hata",
        description: "Lütfen e-posta adresinizi girin.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Geçersiz E-posta",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("email_subscribers")
        .insert({
          email: email.toLowerCase(),
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Zaten Abone",
            description: "Bu e-posta adresi zaten kayıtlı.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Abone Oldunuz! 🎉",
        description: "Yeni içerikler hakkında bilgilendirileceksiniz.",
      });

      setEmail("");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto max-w-2xl">
        <Card className="p-8 bg-card/50 backdrop-blur border-border card-glow text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4 glow-text">
            Haberdar Ol!
          </h2>
          <p className="text-muted-foreground mb-6">
            Yeni yayınlar, özel etkinlikler ve haberler için e-posta listesine katıl
          </p>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subscribe-email" className="sr-only">E-posta</Label>
              <Input
                id="subscribe-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                required
                className="text-center"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Kaydediliyor..." : "Abone Ol"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            E-posta adresiniz güvende. Spam göndermiyoruz.
          </p>
        </Card>
      </div>
    </section>
  );
};

export default EmailSubscribeSection;
