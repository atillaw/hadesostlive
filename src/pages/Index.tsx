import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SnowEffect from "@/components/SnowEffect";
import StreamSection from "@/components/StreamSection";
import AboutSection from "@/components/AboutSection";
import YouTubeSection from "@/components/YouTubeSection";
import KickLiveListener from "@/components/KickLiveListener";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import ErrorBoundary from "@/components/ErrorBoundary";

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
      <ErrorBoundary fallback={null}>
        <SnowEffect enabled={snowEnabled} />
      </ErrorBoundary>
      <Navigation onSnowToggle={() => setSnowEnabled(!snowEnabled)} snowEnabled={snowEnabled} />
      <HeroSection />
      <StreamSection />
      <AboutSection />
      <YouTubeSection />
      <Footer />
      <ErrorBoundary fallback={null}>
        <KickLiveListener />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <AIChatWidget />
      </ErrorBoundary>
    </div>
  );
};

export default Index;
