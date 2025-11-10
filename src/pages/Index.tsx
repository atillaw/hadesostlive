import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SnowEffect from "@/components/SnowEffect";
import StreamSection from "@/components/StreamSection";
import AboutSection from "@/components/AboutSection";
import YouTubeSection from "@/components/YouTubeSection";
import EmailSubscribeSection from "@/components/EmailSubscribeSection";
import VODSection from "@/components/VODSection";
import KickLiveListener from "@/components/KickLiveListener";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import ErrorBoundary from "@/components/ErrorBoundary";
import StreamMiniGames from "@/components/StreamMiniGames";
import SupportContentSection from "@/components/SupportContentSection";
import HolidayBanner from "@/components/HolidayBanner";

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
      <Helmet>
        <title>HadesOST - Canlı Yayın ve Gaming İçerikleri</title>
        <meta name="description" content="HadesOST'un resmi web sitesi. Canlı yayınlar, VOD arşivi, klipler, topluluk özellikleri ve daha fazlası. En iyi gaming içeriklerini keşfedin." />
        <meta property="og:title" content="HadesOST - Canlı Yayın ve Gaming İçerikleri" />
        <meta property="og:description" content="HadesOST'un resmi web sitesi. Canlı yayınlar, VOD arşivi, klipler ve topluluk özellikleri." />
        <meta name="twitter:title" content="HadesOST - Canlı Yayın ve Gaming İçerikleri" />
        <meta name="twitter:description" content="HadesOST'un resmi web sitesi. Canlı yayınlar, VOD arşivi, klipler ve topluluk özellikleri." />
      </Helmet>
      <ErrorBoundary fallback={null}>
        <SnowEffect enabled={snowEnabled} />
      </ErrorBoundary>
      <HolidayBanner />
      <Navigation onSnowToggle={() => setSnowEnabled(!snowEnabled)} snowEnabled={snowEnabled} />
      <HeroSection />
      <StreamSection />
      <div className="container mx-auto px-4 py-12">
        <StreamMiniGames />
      </div>
      <AboutSection />
      <VODSection />
      <EmailSubscribeSection />
      <YouTubeSection />
      <SupportContentSection />
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
