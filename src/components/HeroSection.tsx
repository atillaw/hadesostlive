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
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with parallax effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />
      
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="animate-slide-up">
          <CountdownTimer />
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-lg shadow-secondary/50" />
          <span className="text-secondary font-bold uppercase tracking-wider text-sm md:text-base">
            LİVE NOW
          </span>
        </div>
        
        {/* Social Links - Enhanced */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <span className="text-muted-foreground text-xs md:text-sm w-full mb-3 font-medium">Topluluklarımıza Katılın</span>
          {socials.map((social, index) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 hover:bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:scale-105 hover:shadow-lg"
              style={{ animationDelay: `${0.3 + index * 0.05}s` }}
            >
              <social.icon className={`w-4 h-4 ${social.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs md:text-sm font-medium">{social.name}</span>
            </a>
          ))}
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-8 glow-text animate-scale-in leading-tight" style={{ animationDelay: '0.4s' }}>
          Hadesost
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.5s' }}>
         Oyun yayınları, destansı müzikler ve efsanevi atmosfer. Yeraltı dünyasının en özel topluluğuna katıl!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <Button 
            size="lg" 
            className="rounded-full text-base md:text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            asChild
          >
            <a href="https://kick.com/hadesost" target="_blank" rel="noopener noreferrer">
              <Radio className="w-5 h-5 mr-2" />
              Kick'te İzle
            </a>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full text-base md:text-lg px-8 py-6 border-2 hover:bg-card/50 transition-all hover:scale-105"
            asChild
          >
            <a href="https://discord.gg/FK48T8D77Y" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" />
              Discord'a Katıl
            </a>
          </Button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
