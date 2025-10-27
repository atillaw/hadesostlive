import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, ImageIcon, Video, MessageCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const navLinks = [
    { to: "/memeler", icon: ImageIcon, label: "Meme's" },
    { to: "/sohbet", icon: MessageCircle, label: "Sohbet" },
    { to: "/klipler", icon: Video, label: "Klipler" },
    { to: "/destek", icon: DollarSign, label: "Destek" },
    { to: "/admin", icon: Settings, label: "Admin", target: "_blank" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold glow-text hover:scale-105 transition-transform"
          >
            Hadesost
          </Link>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center gap-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} target={link.target}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-card/50 hover:border-primary/50 transition-all hover:scale-105"
                  >
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-card/50"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && isOpen && (
          <div className="mt-4 pb-4 space-y-2 animate-slide-up">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                target={link.target}
                onClick={() => setIsOpen(false)}
                className="block"
              >
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-card/50 hover:border-primary/50 transition-all"
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
