import { Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MinecraftFooter = () => {
  return (
    <footer className="bg-card/50 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-xl font-bold mb-4">
              <Gamepad2 className="w-6 h-6 text-emerald-500" />
              <span className="text-foreground">Hades<span className="text-emerald-500">Ost</span></span>
            </div>
            <p className="text-muted-foreground mb-4">
              Türkiye'nin en iyi Minecraft sunucusu. Eğlenceli, güvenli ve adil oyun deneyimi.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://discord.gg/hadesost" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#5865F2] rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a 
                href="https://kick.com/hadesost" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center hover:bg-[#53FC18] group transition-colors"
              >
                <svg className="w-5 h-5 text-white group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.333 0v24h5.334v-8l8 8h6.666l-9.333-9.333L21.333 5.333h-6.666l-8 8V0z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/minecraft" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/minecraft/vip" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  VIP Paketleri
                </Link>
              </li>
              <li>
                <Link to="/minecraft/about" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/minecraft/contact" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Server Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Sunucu Bilgileri</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>IP: <span className="text-emerald-500">mc.hadesost.uk</span></li>
              <li>Sürüm: 1.20.x</li>
              <li>Tür: Survival</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} HadesOst. Tüm hakları saklıdır.</p>
          <p className="mt-2">
            <Link to="/" className="hover:text-emerald-500 transition-colors">
              ← Ana Siteye Dön
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MinecraftFooter;
