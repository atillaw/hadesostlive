import { Button } from "@/components/ui/button";
import { MessageCircle, Radio, Youtube, Instagram } from "lucide-react";

// Reddit ikon SVG (örnek, basit)
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

const SocialSection = () => {
  const socials = [
    {
      name: "Kick",
      icon: Radio,
      url: "https://kick.com/hadesost",
      description: "Canlı Yayınları İzle",
      color: "text-green-500",
      hoverColor: "hover:bg-green-500/10"
    },
    {
      name: "Discord",
      icon: MessageCircle,
      url: "https://discord.gg/FK48T8D77Y",
      description: "Discord Toplulugu",
      color: "text-indigo-500",
      hoverColor: "hover:bg-indigo-500/10"
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://www.youtube.com/@hadesost",
      description: "Yayın Tekrarları",
      color: "text-red-500",
      hoverColor: "hover:bg-red-500/10"
    },
    {
      name: "Ganare Kopek",
      icon: Instagram,
      url: "https://www.instagram.com/ganarekopek/",
      description: "Skeç Komedi İçerigi",
      color: "text-pink-500",
      hoverColor: "hover:bg-pink-500/10"
    },
    {
      name: "Hadesdenost",
      icon: Instagram,
      url: "https://www.instagram.com/hadesdenost/",
      description: "Yayın Enleri, Klipler",
      color: "text-pink-500",
      hoverColor: "hover:bg-pink-500/10"
    },
    {
      name: "Reddit",
      icon: RedditIcon,
      url: "https://www.reddit.com/r/HadesostveMelekleri/",
      description: "Reddit Toplulugu",
      color: "text-orange-500",
      hoverColor: "hover:bg-orange-500/10"
    },
  ];

  return (
    <section className="py-16 md:py-24 container mx-auto px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">
            Topluluklarımıza Katılın
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Tüm platformlarda takip et, abone ol ve topluluğa katıl.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {socials.map((social, index) => (
            <a 
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`h-full p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm ${social.hoverColor} transition-all duration-300 hover:border-primary/50 hover:shadow-lg card-glow`}>
                <div className="flex flex-col items-center text-center gap-3">
                  <social.icon className={`w-10 h-10 ${social.color} group-hover:scale-110 transition-transform duration-300`} />
                  <div>
                    <div className="font-bold text-lg mb-1">{social.name}</div>
                    <div className="text-sm text-muted-foreground">{social.description}</div>
                  </div>
                  <svg className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialSection;
