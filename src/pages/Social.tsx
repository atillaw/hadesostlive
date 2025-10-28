import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SocialSection from "@/components/SocialSection";

const Social = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <SocialSection />
      </main>
      <Footer />
    </div>
  );
};

export default Social;
