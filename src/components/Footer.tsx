const Footer = () => {
  return (
    <footer className="border-t border-border py-8 mt-20">
      <div className="container mx-auto px-4 text-center">
        <p className="text-muted-foreground mb-2">
          © {new Date().getFullYear()} HadesOST. All rights reserved.
        </p>
        <p className="text-sm text-muted-foreground">
          Built for the community, powered by passion.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
