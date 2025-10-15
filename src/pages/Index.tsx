import HeroSection from "@/components/HeroSection";
import StreamSection from "@/components/StreamSection";
import AboutSection from "@/components/AboutSection";
import ScheduleSection from "@/components/ScheduleSection";
import TeamApplicationSection from "@/components/TeamApplicationSection";
import VODManagement from "@/components/VODManagement";
import VODSection from "@/components/VODSection";
import SocialSection from "@/components/SocialSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StreamSection />
      <AboutSection />
      <ScheduleSection />
      <TeamApplicationSection />
      <VODManagement />
      <VODSection />
      <SocialSection />
      <Footer />
    </div>
  );
};

export default Index;
