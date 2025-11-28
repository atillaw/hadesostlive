import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, ImageIcon, Video, MessageCircle, Menu, X, Snowflake, Heart, Home, Calendar, Bell, Users, Trophy, Sparkles, Award, UserCircle, Search, Mail, Rss, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import ForumSearch from "./ForumSearch";
import { NotificationDropdown } from "./NotificationDropdown";

const Navigation = ({ onSnowToggle, snowEnabled }: { onSnowToggle?: () => void; snowEnabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    
    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadUser();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUsername(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setUsername(profile.username);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUsername(null);
    setIsOpen(false);
    navigate("/");
  };

  const allNavLinks = [
    { to: "/", icon: Home, label: "Ana Sayfa" },
    { to: "/yayin-akisi", icon: Calendar, label: "Yayın Akışı" },
    { to: "/vodlar", icon: Video, label: "VODs & Highlights" },
    { to: "/takima-katil", icon: Users, label: "Takıma Katıl" },
    { to: "/topluluk", icon: Sparkles, label: "Topluluk" },
    { to: "/forum", icon: MessageCircle, label: "Forum" },
    { to: "/kaydedilenler", icon: Award, label: "Kaydedilenler", authRequired: true },
    { to: "/ayarlar", icon: Settings, label: "Kullanıcı Ayarları", authRequired: true },
    { to: "/forum-kurallari", icon: Settings, label: "Forum Kuralları" },
    { to: "/aboneler", icon: Heart, label: "Aboneler" },
    { to: "/sponsorlar", icon: Award, label: "Sponsorlar" },
    { to: "/memeler", icon: ImageIcon, label: "Meme's" },
    { to: "/klipler", icon: Video, label: "Klipler" },
    { to: "/impact-points", icon: Trophy, label: "Impact Points" },
    { to: "/destek", icon: DollarSign, label: "Destek" },
    { to: "/admin", icon: Settings, label: "Admin" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold glow-text hover:scale-105 transition-transform"
          >
            Hadesost
          </Link>

          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="hover:bg-card/50 hover:scale-105 transition-all"
            >
              <Search className="h-6 w-6" />
            </Button>

            {/* Authenticated User Actions */}
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/takip-akisi")}
                  className="hover:bg-card/50 hover:scale-105 transition-all"
                  title="Takip Akışı"
                >
                  <Rss className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/mesajlar")}
                  className="hover:bg-card/50 hover:scale-105 transition-all"
                  title="Mesajlar"
                >
                  <Mail className="h-6 w-6" />
                </Button>
                <NotificationDropdown />
              </>
            )}
            
            {/* Hamburger Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="hover:bg-card/50 hover:scale-105 transition-all"
              >
                <Menu className="h-12 w-12" strokeWidth={2.5} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background/98 backdrop-blur-xl border-l border-primary/30">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold glow-text">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-2">
                {username && (
                  <Link 
                    to={`/u/${username}`}
                    onClick={() => setIsOpen(false)}
                    className="block mb-4"
                  >
                    <Button 
                      variant="outline"
                      className="w-full justify-start rounded-full hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105"
                    >
                      <UserCircle className="mr-3 h-5 w-5" />
                      <span className="text-base">Profilim (u/{username})</span>
                    </Button>
                  </Link>
                )}
                {onSnowToggle && (
                  <Button
                    variant={snowEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={onSnowToggle}
                    className="w-full justify-start rounded-full hover:scale-105 transition-transform mb-4"
                  >
                    <Snowflake className={`mr-2 h-4 w-4 ${snowEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                    {snowEnabled ? "Karı Kapat" : "Karı Aç"}
                  </Button>
                )}
                {allNavLinks.map((link) => (
                  <Link 
                    key={link.to} 
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start rounded-full hover:bg-card/50 hover:text-primary transition-all hover:scale-105 hover:glow-border"
                    >
                      <link.icon className="mr-3 h-5 w-5" />
                      <span className="text-base">{link.label}</span>
                    </Button>
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="w-full justify-start rounded-full hover:scale-105 transition-all mt-4"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    <span className="text-base">Çıkış Yap</span>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>

      <ForumSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
};

export default Navigation;
