import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import MinecraftNavbar from '@/components/minecraft/MinecraftNavbar';
import MinecraftFooter from '@/components/minecraft/MinecraftFooter';

const MinecraftContact = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submitMessage = useMutation({
    mutationFn: async () => {
      if (!email || !subject || !message) {
        throw new Error('Lütfen tüm alanları doldurun');
      }

      const { error } = await supabase
        .from('minecraft_contact_messages')
        .insert({ email, subject, message });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mesajınız başarıyla gönderildi!');
      setEmail('');
      setSubject('');
      setMessage('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Bir hata oluştu');
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <MinecraftNavbar />
      
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              İletişim
            </h1>
            <p className="text-muted-foreground text-lg">
              Sorularınız, önerileriniz veya şikayetleriniz için bize ulaşın
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-emerald-500/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Discord</h3>
                <a 
                  href="https://discord.gg/hadesost" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:underline"
                >
                  discord.gg/hadesost
                </a>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-emerald-500/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">E-posta</h3>
                <a 
                  href="mailto:destek@hadesost.uk"
                  className="text-emerald-500 hover:underline"
                >
                  destek@hadesost.uk
                </a>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-emerald-500 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Mesaj Gönder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  E-posta Adresiniz
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="bg-background/50 border-border"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Konu
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Mesajınızın konusu"
                  className="bg-background/50 border-border"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Mesajınız
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı buraya yazın..."
                  rows={6}
                  className="bg-background/50 border-border"
                />
              </div>

              <Button 
                onClick={() => submitMessage.mutate()}
                disabled={submitMessage.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitMessage.isPending ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <MinecraftFooter />
    </div>
  );
};

export default MinecraftContact;
