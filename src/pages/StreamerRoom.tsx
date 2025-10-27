import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Monitor, Headphones, Keyboard, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const StreamerRoom = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const gear = [
    {
      id: 'mic',
      icon: Mic,
      name: 'Mikrofon',
      description: 'Profesyonel stüdyo mikrofonu',
      position: { top: '40%', left: '30%' },
      details: 'Yüksek kaliteli ses kaydı için kullanılan profesyonel ekipman'
    },
    {
      id: 'monitor',
      icon: Monitor,
      name: 'Monitör',
      description: 'Gaming monitör',
      position: { top: '35%', left: '50%' },
      details: '240Hz yenileme hızı, ultra düşük gecikme'
    },
    {
      id: 'headphones',
      icon: Headphones,
      name: 'Kulaklık',
      description: 'Gaming kulaklık',
      position: { top: '50%', left: '20%' },
      details: '7.1 surround ses sistemi'
    },
    {
      id: 'keyboard',
      icon: Keyboard,
      name: 'Klavye',
      description: 'Mekanik klavye',
      position: { top: '65%', left: '45%' },
      details: 'Cherry MX Red switchler ile mekanik hissiyat'
    },
    {
      id: 'camera',
      icon: Camera,
      name: 'Kamera',
      description: 'Webcam',
      position: { top: '25%', left: '70%' },
      details: '4K çözünürlük, 60fps'
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navigation />
      
      {/* 3D Room Effect */}
      <div className="fixed inset-0 z-0" style={{
        background: 'linear-gradient(135deg, hsl(240 10% 3.9%) 0%, hsl(271 50% 5%) 50%, hsl(240 10% 3.9%) 100%)',
      }}>
        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-30"
          style={{
            background: 'linear-gradient(to top, hsl(271 50% 10%) 0%, transparent 100%)',
          }}
        />
        
        {/* Walls */}
        <div className="absolute top-0 left-0 w-1/4 h-full opacity-20"
          style={{
            background: 'linear-gradient(to right, hsl(271 50% 8%) 0%, transparent 100%)',
          }}
        />
        <div className="absolute top-0 right-0 w-1/4 h-full opacity-20"
          style={{
            background: 'linear-gradient(to left, hsl(271 50% 8%) 0%, transparent 100%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 pt-24 relative z-10">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 glow-text">Yayıncının Odası</h1>
          <p className="text-muted-foreground text-lg">
            Ekipmanların üzerine gelerek detayları keşfet
          </p>
        </div>

        {/* Interactive 3D Room */}
        <div className="relative w-full h-[600px] rounded-lg border-2 border-primary/30 overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(271 50% 8%) 0%, hsl(240 10% 3.9%) 100%)',
            boxShadow: 'inset 0 0 100px hsl(var(--primary) / 0.2)',
          }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 animate-pulse-glow opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
            }}
          />

          {/* Gear items */}
          {gear.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredItem === item.id;
            
            return (
              <div
                key={item.id}
                className="absolute cursor-pointer transition-all duration-300"
                style={{
                  ...item.position,
                  transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className={`relative ${isHovered ? 'animate-pulse-glow' : ''}`}>
                  <Icon 
                    className="h-16 w-16 text-primary" 
                    style={{
                      filter: isHovered ? 'drop-shadow(0 0 20px hsl(var(--primary)))' : 'none',
                    }}
                  />
                  
                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 rounded-full blur-xl opacity-50"
                    style={{
                      background: isHovered ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--primary) / 0.2)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Panel */}
        {hoveredItem && (
          <Card className="mt-8 animate-scale-in snow-accent">
            <CardHeader>
              <CardTitle>
                {gear.find(g => g.id === hoveredItem)?.name}
              </CardTitle>
              <CardDescription>
                {gear.find(g => g.id === hoveredItem)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {gear.find(g => g.id === hoveredItem)?.details}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StreamerRoom;
