import { Button } from "@/components/ui/button";
import { Twitch, Radio, MessageCircle, Youtube, Instagram } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import CountdownTimer from "./CountdownTimer";

// Reddit Icon
const RedditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 12.5c0 .828-.672 1.5-1.5 1.5S12.5 15.328 12.5 14.5 13.172 13 14 13s1.5.672 1.5 1.5zm-7 0C8 15.328 7.328 16 6.5 16S5 15.328 5 14.5 5.672 13 6.5 13 8 13.672 8 14.5zM12 17c-1.933 0-3.654-.995-4.704-2.5h9.408C15.654 16.005 13.933 17 12 17zm5.061-9.5l-2.03.507a5.507 5.507 0 0 0-1.45-1.45l.507-2.03 1.977.506a.75.75 0 1 0 .39-1.47l-2.316-.592a.75.75 0 0 0-.88.592l-.585 2.346a5.52 5.52 0 0 0-1.646 0l-.585-2.346a.75.75 0 0 0-.88-.592l-2.316.592a.75.75 0 1 0 .39 1.47l1.977-.506.507 2.03a5.507 5.507 0 0 0-1.45 1.45l-2.03-.507a.75.75 0 1 0-.39 1.47l2.316.592a.75.75 0 0 0 .88-.592l.585-2.346a5.52 5.52 0 0 0 1.646 0l.585 2.346a.75.75 0 0 0 .88.592l2.316-.592a.75.75 0 0 0-.39-1.47l-2.03.507a5.507 5.507 0 0 0 1.45-1.45l.507 2.03a.75.75 0 1 0 1.47-.39l-.592-2.316a.75.75 0 0 0-.592-.88z" />
  </svg>
);

const HeroSection = () => {
  const socials = [
    {
      name: "Kick",
      icon: Radio,
      url: "https://kick.com/hadesost",
      color: "text-green-500"
    },
    {
      name: "Discord",
      icon: MessageCircle,
      url: "https://discord.gg/FK48T8D77Y",
      color: "text-indigo-500"
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://www.youtube.com/@hadesost",
      color: "text-red-500"
    },
    {
      name: "Ganare Kopek",
      icon: Instagram,
      url: "https://www.instagram.com/ganarekopek/",
      color: "text-pink-500"
    },
    {
      name: "Hadesdenost",
      icon: Instagram,
      url: "https://www.instagram.com/hadesdenost/",
      color: "text-pink-500"
    },
    {
      name: "Reddit",
      icon: RedditIcon,
      url: "https://www.reddit.com/r/HadesostveMelekleri/",
      color: "text-orange-500"
    },
  ];

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <CountdownTimer />
        
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
          <span className="text-secondary font-semibold uppercase tracking-wider text-sm">
            LİVE NOW
          </span>
        </div>
        
        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 max-w-2xl mx-auto">
          <span className="text-muted-foreground text-sm w-full mb-2">Topluluklarımıza Katılın</span>
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/50 hover:bg-card border border-border/50 hover:border-primary/50 transition-all"
            >
              <social.icon className={`w-4 h-4 ${social.color}`} />
              <span className="text-sm font-medium">{social.name}</span>
            </a>
          ))}
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 glow-text">
          Hadesost
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
         Oyun yayınları, destansı müzikler ve efsanevi atmosfer. Yeraltı dünyasının en özel topluluğuna katıl!
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="text-lg px-8">
            <Radio className="w-5 h-5" />
            Kick'te İzle
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            <Radio className="w-5 h-5" />
           Discord linki
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
