import FooterClock from "./FooterClock";

const Footer = () => {
  return (
    <footer className="relative border-t border-border/50 py-12 mt-20 bg-gradient-to-t from-card/30 to-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-3">
            <p className="text-lg font-semibold glow-text">HadesOST</p>
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} Tüm hakları saklıdır.
            </p>
            <p className="text-sm text-muted-foreground">
              Topluluk için yapıldı, tutkuyla güçlendirildi. ❤️
            </p>
          </div>
          <FooterClock />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
