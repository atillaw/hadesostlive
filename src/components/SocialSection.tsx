import { Button } from "@/components/ui/button";
import { MessageCircle, Radio, Youtube } from "lucide-react";

const SocialSection = () => {
  const socials = [
    {
      name: "Kick",
      icon: Radio,
      url: "https://kick.com/hadesost",
      description: "Watch live streams",
      color: "text-green-500"
    },
    {
      name: "Discord",
      icon: MessageCircle,
      url: "https://discord.gg/FK48T8D77Y",
      description: "Join the community",
      color: "text-indigo-500"
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "#",
      description: "VODs & highlights",
      color: "text-red-500"
    },
  ];

  return (
    <section className="py-20 container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Connect With Me
        </h2>
        <p className="text-muted-foreground mb-12 text-lg">
          Follow, subscribe, and join the community across all platforms
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {socials.map((social) => (
            <a 
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                variant="social" 
                size="lg"
                className="w-full h-auto py-6 flex-col gap-3"
              >
                <social.icon className={`w-8 h-8 ${social.color}`} />
                <div>
                  <div className="font-bold text-lg">{social.name}</div>
                  <div className="text-sm text-muted-foreground">{social.description}</div>
                </div>
              </Button>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialSection;
