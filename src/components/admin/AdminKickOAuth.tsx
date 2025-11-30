import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminKickOAuth = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const redirectUrl = `${supabaseUrl}/functions/v1/kick-oauth-callback`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: "URL panoya kopyalandı.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kick OAuth Ayarları</CardTitle>
          <CardDescription>
            Kick OAuth entegrasyonu için gerekli redirect URL bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Redirect URI</label>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-muted/50 border border-border rounded-lg text-sm font-mono break-all">
                  {redirectUrl}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(redirectUrl)}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Bu URL'yi Kick Developer Console'da OAuth uygulamanızın Redirect URI alanına eklemelisiniz.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">OAuth Authorization URL</label>
              <div className="mt-2">
                <code className="block px-4 py-3 bg-muted/50 border border-border rounded-lg text-sm font-mono break-all">
                  https://kick.com/oauth2/authorize
                </code>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">OAuth Token URL</label>
              <div className="mt-2">
                <code className="block px-4 py-3 bg-muted/50 border border-border rounded-lg text-sm font-mono break-all">
                  https://kick.com/oauth2/token
                </code>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Scopes</label>
              <div className="mt-2">
                <code className="block px-4 py-3 bg-muted/50 border border-border rounded-lg text-sm font-mono">
                  user:read
                </code>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3">Kurulum Adımları</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Kick Developer Console'a gidin</li>
              <li>OAuth uygulamanızı seçin veya yeni bir tane oluşturun</li>
              <li>Redirect URI alanına yukarıdaki URL'yi ekleyin</li>
              <li>Client ID ve Client Secret'ı kaydedin</li>
              <li>Bu bilgileri Lovable Cloud secrets bölümünde KICK_CLIENT_ID ve KICK_CLIENT_SECRET olarak ekleyin</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://kick.com/settings/developers", "_blank")}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Kick Developer Console
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminKickOAuth;
