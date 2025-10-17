import { Link } from "react-router-dom";
import { Shield, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold glow-text">
            Hadesost
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/game-content">
              <Button variant="ghost" className="gap-2">
                <Gamepad2 className="w-4 h-4" />
                Oyun İçerikleri
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" className="gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
