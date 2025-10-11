import HeroSection from "@/components/HeroSection";
import StreamSection from "@/components/StreamSection";
import AboutSection from "@/components/AboutSection";
import ScheduleSection from "@/components/ScheduleSection";
import SocialSection from "@/components/SocialSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StreamSection />
      <AboutSection />
      <ScheduleSection />
      <SocialSection />
      <Footer />
    </div>
  );
};

export default Index;
