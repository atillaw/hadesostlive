import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, ImageIcon, Video, MessageCircle } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold glow-text">
          Hadesost
        </Link>
        
        <div className="flex items-center gap-2">
          <Link to="/memeler">
            <Button variant="outline" size="sm">
              <ImageIcon className="mr-2 h-4 w-4" />
              Meme's
            </Button>
          </Link>
          <Link to="/sohbet">
            <Button variant="outline" size="sm">
              <MessageCircle className="mr-2 h-4 w-4" />
              Sohbet
            </Button>
          </Link>
          <Link to="/klipler">
            <Button variant="outline" size="sm">
              <Video className="mr-2 h-4 w-4" />
              Klipler
            </Button>
          </Link>
          <Link to="/destek">
            <Button variant="outline" size="sm">
              <DollarSign className="mr-2 h-4 w-4" />
              Destek(Bedonli adamdır)
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
