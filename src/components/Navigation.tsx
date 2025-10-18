import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Gamepad2 } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold glow-text">
          Hadesost
        </Link>
        
        <div className="flex gap-3">
          <Link to="/games" target="_blank">
            <Button variant="outline" size="sm">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Oyun İçerikleri
            </Button>
          </Link>
          <Link to="/admin" target="_blank">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Admin Panel
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
