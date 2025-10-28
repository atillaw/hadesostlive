import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SnowEffect from "@/components/SnowEffect";
import StreamSection from "@/components/StreamSection";
import AboutSection from "@/components/AboutSection";
import YouTubeSection from "@/components/YouTubeSection";
import ScheduleSection from "@/components/ScheduleSection";
import TeamApplicationSection from "@/components/TeamApplicationSection";
import VODSection from "@/components/VODSection";
import SocialSection from "@/components/SocialSection";
import EmailSubscribeSection from "@/components/EmailSubscribeSection";
import KickLiveListener from "@/components/KickLiveListener";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";

const Index = () => {
  const [snowEnabled, setSnowEnabled] = useState(() => {
    const saved = localStorage.getItem('winter-theme');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('winter-theme', snowEnabled.toString());
  }, [snowEnabled]);

  return (
    <div className="min-h-screen">
      <SnowEffect enabled={snowEnabled} />
      <Navigation onSnowToggle={() => setSnowEnabled(!snowEnabled)} snowEnabled={snowEnabled} />
      <HeroSection />
      <StreamSection />
      <AboutSection />
      <YouTubeSection />
      <ScheduleSection />
      <VODSection />
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
