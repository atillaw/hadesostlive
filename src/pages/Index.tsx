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
import KickSubscribersSection from "@/components/KickSubscribersSection";
import KickLiveListener from "@/components/KickLiveListener";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <StreamSection />
      <AboutSection />
      <ScheduleSection />
      <VODSection />
      <KickSubscribersSection />
      <ContentIdeasSection />
      <EmailSubscribeSection />
      <TeamApplicationSection />
      <SocialSection />
      <Footer />
      <KickLiveListener />
      <AIChatWidget />
    </div>
  );
};

export default Index;
