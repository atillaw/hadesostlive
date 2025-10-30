import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, ImageIcon, Video, MessageCircle, Menu, X, Snowflake, Heart, Home, Calendar, Bell, Users, Trophy, Sparkles } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Navigation = ({ onSnowToggle, snowEnabled }: { onSnowToggle?: () => void; snowEnabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const allNavLinks = [
    { to: "/", icon: Home, label: "Ana Sayfa" },
    { to: "/yayin-akisi", icon: Calendar, label: "Yayın Akışı" },
    { to: "/vodlar", icon: Video, label: "VODs & Highlights" },
    { to: "/takima-katil", icon: Users, label: "Takıma Katıl" },
    { to: "/topluluk", icon: Sparkles, label: "Topluluk" },
    { to: "/aboneler", icon: Heart, label: "Aboneler" },
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
          
          {/* Hamburger Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="hover:bg-card/50 hover:scale-105 transition-all"
              >
                <Menu className="h-9 w-9" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background/98 backdrop-blur-xl border-l border-primary/30">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold glow-text">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-2">
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
