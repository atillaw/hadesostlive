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
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-primary/5 animate-fade-in">
      <div className="container mx-auto max-w-2xl">
        <Card className="p-8 md:p-10 bg-card/50 backdrop-blur-sm border-primary/30 card-glow text-center animate-slide-up">
          <div className="flex justify-center mb-6 animate-scale-in">
            <div className="p-5 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
              <Mail className="h-10 w-10 text-primary" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 glow-text">
            Haberdar Ol!
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mb-8">
            Yeni yayınlar, özel etkinlikler ve haberler için e-posta listesine katıl 📧
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
                className="text-center text-base h-12"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 text-base hover:scale-105 transition-transform"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Kaydediliyor...
                </span>
              ) : (
                "Abone Ol"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            E-posta adresiniz güvende. Spam göndermiyoruz.
          </p>
        </Card>
      </div>
    </section>
  );
};

export default EmailSubscribeSection;
