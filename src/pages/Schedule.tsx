import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScheduleSection from "@/components/ScheduleSection";

const Schedule = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Yayın Akışı - HadesOST | Takvim ve Program</title>
        <meta name="description" content="HadesOST'un haftalık yayın programı ve takvimine göz atın. Canlı yayın zamanlarını kaçırmayın." />
        <meta property="og:title" content="Yayın Akışı - HadesOST" />
        <meta property="og:description" content="Haftalık yayın programı ve takvimine göz atın." />
        <meta name="twitter:title" content="Yayın Akışı - HadesOST" />
        <meta name="twitter:description" content="Haftalık yayın programı ve takvimine göz atın." />
      </Helmet>
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <ScheduleSection />
      </main>
      <Footer />
    </div>
  );
};

export default Schedule;
