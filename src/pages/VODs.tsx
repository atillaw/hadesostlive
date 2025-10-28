import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VODSection from "@/components/VODSection";

const VODs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <VODSection />
      </main>
      <Footer />
    </div>
  );
};

export default VODs;
