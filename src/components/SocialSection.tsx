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
      color: "text-green-500"
    },
    {
      name: "Discord",
      icon: MessageCircle,
      url: "https://discord.gg/FK48T8D77Y",
      description: "Discord Toplulugu",
      color: "text-indigo-500"
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://www.youtube.com/@hadesost",
      description: "Yayın Tekrarları",
      color: "text-red-500"
    },
    {
      name: "Ganare Kopek",
      icon: Instagram,
      url: "https://www.instagram.com/ganarekopek/",
      description: "Skeç Komedi İçerigi",
      color: "text-pink-500"
    },
    {
      name: "Hadesdenost",
      icon: Instagram,
      url: "https://www.instagram.com/hadesdenost/",
      description: "Yayın Enleri, Klipler",
      color: "text-pink-500"
    },
    {
      name: "Reddit",
      icon: RedditIcon,
      url: "https://www.reddit.com/r/HadesostveMelekleri/",
      description: "Reddit Toplulugu",
      color: "text-orange-500"
    },
  ];

  return (
    <section className="py-20 container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-centered">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Topluluklarımıza Katılın
        </h2>
        <p className="text-muted-foreground mb-12 text-lg">
          Tüm platformlarda takip et, abone ol ve topluluğa katıl.
        </p>
        
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
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
