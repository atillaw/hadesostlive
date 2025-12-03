import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

interface KickAccount {
  kick_username: string;
  kick_avatar_url?: string;
  is_token_expired?: boolean;
}

export const KickStatusIndicator = () => {
  const [kickAccount, setKickAccount] = useState<KickAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkKickConnection();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        checkKickConnection();
      } else {
        setKickAccount(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkKickConnection = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsAuthenticated(false);
      return;
    }
    
    setIsAuthenticated(true);

    try {
      const response = await supabase.functions.invoke("kick-get-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.data?.connected && response.data?.account) {
        setKickAccount(response.data.account);
      } else {
        setKickAccount(null);
      }
    } catch (error) {
      console.error("Failed to check Kick connection:", error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/kullanici-ayarlari">
            <Badge 
              variant={kickAccount ? "default" : "secondary"}
              className={`cursor-pointer transition-all hover:scale-105 ${
                kickAccount 
                  ? kickAccount.is_token_expired 
                    ? "bg-amber-500/20 text-amber-500 border-amber-500/30"
                    : "bg-green-500/20 text-green-500 border-green-500/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className={`w-2 h-2 rounded-full mr-1.5 ${
                kickAccount 
                  ? kickAccount.is_token_expired 
                    ? "bg-amber-500"
                    : "bg-green-500 animate-pulse"
                  : "bg-muted-foreground"
              }`} />
              Kick
            </Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          {kickAccount ? (
            <div className="text-sm">
              <p className="font-medium">{kickAccount.kick_username}</p>
              {kickAccount.is_token_expired ? (
                <p className="text-amber-500 text-xs">Token yenilenmesi gerekiyor</p>
              ) : (
                <p className="text-green-500 text-xs">Bağlı</p>
              )}
            </div>
          ) : (
            <p className="text-sm">Kick hesabı bağlı değil</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default KickStatusIndicator;
