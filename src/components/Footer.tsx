import FooterClock from "./FooterClock";

const Footer = () => {
  return (
    <footer className="border-t border-border py-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-muted-foreground mb-2">
              © {new Date().getFullYear()} HadesOST. Tüm hakları saklıdır.
            </p>
            <p className="text-sm text-muted-foreground">
              Topluluk için yapıldı, tutkuyla güçlendirildi.
            </p>
          </div>
          <FooterClock />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
