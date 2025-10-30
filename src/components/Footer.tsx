import FooterClock from "./FooterClock";
import { Link } from "react-router-dom";
import { Mail, Twitter, Youtube, Instagram, Twitch } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative border-t border-border/50 mt-20 bg-gradient-to-t from-card/30 to-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Site Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold glow-text">HadesOST</h3>
            <p className="text-sm text-muted-foreground">
              Topluluk için yapıldı, tutkuyla güçlendirildi. ❤️
            </p>
            <FooterClock />
          </div>

          {/* Site Özellikleri */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Site Özellikleri</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/vodlar" className="text-muted-foreground hover:text-primary transition-colors">VODs & Highlights</Link></li>
              <li><Link to="/klipler" className="text-muted-foreground hover:text-primary transition-colors">Klipler</Link></li>
              <li><Link to="/memeler" className="text-muted-foreground hover:text-primary transition-colors">Meme Galerisi</Link></li>
              <li><Link to="/topluluk" className="text-muted-foreground hover:text-primary transition-colors">Topluluk</Link></li>
              <li><Link to="/impact-points" className="text-muted-foreground hover:text-primary transition-colors">Impact Points</Link></li>
            </ul>
          </div>

          {/* Kaynaklar & Blog */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Kaynaklar</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/yayin-akisi" className="text-muted-foreground hover:text-primary transition-colors">Yayın Akışı</Link></li>
              <li><Link to="/takima-katil" className="text-muted-foreground hover:text-primary transition-colors">Takıma Katıl</Link></li>
              <li><Link to="/aboneler" className="text-muted-foreground hover:text-primary transition-colors">Aboneler</Link></li>
              <li><Link to="/destek" className="text-muted-foreground hover:text-primary transition-colors">Destek Ol</Link></li>
            </ul>
          </div>

          {/* İletişim & Sosyal Medya */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">İletişim</h4>
            <div className="flex gap-3 flex-wrap">
              <a 
                href="https://twitch.tv/hadesost" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-card/50 hover:bg-primary/20 hover:scale-110 transition-all"
                aria-label="Twitch"
              >
                <Twitch className="h-5 w-5" />
              </a>
              <a 
                href="https://youtube.com/@hadesost" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-card/50 hover:bg-primary/20 hover:scale-110 transition-all"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/hadesost" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-card/50 hover:bg-primary/20 hover:scale-110 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com/hadesost" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-card/50 hover:bg-primary/20 hover:scale-110 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="mailto:contact@hadesost.com"
                className="p-2 rounded-full bg-card/50 hover:bg-primary/20 hover:scale-110 transition-all"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} HadesOST. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
