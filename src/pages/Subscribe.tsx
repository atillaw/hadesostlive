import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import EmailSubscribeSection from "@/components/EmailSubscribeSection";

const Subscribe = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <EmailSubscribeSection />
      </main>
      <Footer />
    </div>
  );
};

export default Subscribe;
