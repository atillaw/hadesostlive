import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TeamApplicationSection from "@/components/TeamApplicationSection";

const Team = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Takıma Katıl - HadesOST | İş Başvurusu</title>
        <meta name="description" content="HadesOST ekibine katılın. Editör, moderatör ve içerik üreticisi başvuruları için form doldurun." />
        <meta property="og:title" content="Takıma Katıl - HadesOST" />
        <meta property="og:description" content="Ekibimize katılın ve bizimle çalışın." />
        <meta name="twitter:title" content="Takıma Katıl - HadesOST" />
        <meta name="twitter:description" content="Ekibimize katılın ve bizimle çalışın." />
      </Helmet>
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <TeamApplicationSection />
      </main>
      <Footer />
    </div>
  );
};

export default Team;
