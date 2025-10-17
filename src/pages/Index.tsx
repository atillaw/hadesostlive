import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StreamSection from "@/components/StreamSection";
import AboutSection from "@/components/AboutSection";
import ScheduleSection from "@/components/ScheduleSection";
import TeamApplicationSection from "@/components/TeamApplicationSection";
import VODSection from "@/components/VODSection";
import SocialSection from "@/components/SocialSection";
import ContentIdeasSection from "@/components/ContentIdeasSection";
import EmailSubscribeSection from "@/components/EmailSubscribeSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <StreamSection />
      <AboutSection />
      <ScheduleSection />
      <VODSection />
      <ContentIdeasSection />
      <EmailSubscribeSection />
      <TeamApplicationSection />
      <SocialSection />
      <Footer />
    </div>
  );
};

export default Index;
