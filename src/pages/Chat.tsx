import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MemeChatRoom from "@/components/MemeChatRoom";

const Chat = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Sohbet Odası</h1>
          <p className="text-muted-foreground">
            Toplulukla sohbet et, eğlen!
          </p>
        </div>

        <MemeChatRoom />
      </div>
    </div>
  );
};

export default Chat;