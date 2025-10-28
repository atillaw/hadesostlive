import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TeamApplicationSection from "@/components/TeamApplicationSection";

const Team = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <TeamApplicationSection />
      </main>
      <Footer />
    </div>
  );
};

export default Team;
