import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import WeatherEffects from "@/components/WeatherEffects";
import AmbientSound from "@/components/AmbientSound";
import MoodSync from "@/components/MoodSync";
import EasterEggs from "@/components/EasterEggs";
import ParallaxBackground from "@/components/ParallaxBackground";
import VisitorSoulLights from "@/components/VisitorSoulLights";
import ReactiveBackground from "@/components/ReactiveBackground";
import StreamSection from "@/components/StreamSection";
import AboutSection from "@/components/AboutSection";
import ScheduleSection from "@/components/ScheduleSection";
import TeamApplicationSection from "@/components/TeamApplicationSection";
import VODSection from "@/components/VODSection";
import SocialSection from "@/components/SocialSection";
import ContentIdeasSection from "@/components/ContentIdeasSection";
import MemoryWall from "@/components/MemoryWall";
import EmailSubscribeSection from "@/components/EmailSubscribeSection";
import KickSubscribersSection from "@/components/KickSubscribersSection";
import KickLiveListener from "@/components/KickLiveListener";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";

const Index = () => {
  const [weatherEnabled, setWeatherEnabled] = useState(() => {
    const saved = localStorage.getItem('weather-theme');
    return saved !== null ? saved === 'true' : true;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('ambient-sound');
    return saved !== null ? saved === 'true' : false;
  });

  const [streamerStatus, setStreamerStatus] = useState<'offline' | 'live' | 'event'>('offline');

  useEffect(() => {
    localStorage.setItem('weather-theme', weatherEnabled.toString());
  }, [weatherEnabled]);

  useEffect(() => {
    localStorage.setItem('ambient-sound', soundEnabled.toString());
  }, [soundEnabled]);

  // Auto-detect season
  const getSeason = () => {
    const month = new Date().getMonth();
    if (month >= 11 || month <= 1) return 'winter';
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    return 'autumn';
  };

  return (
    <div className="min-h-screen relative">
      <ParallaxBackground />
      <ReactiveBackground />
      <WeatherEffects enabled={weatherEnabled} season={getSeason()} />
      <AmbientSound enabled={soundEnabled} theme="underworld" />
      <MoodSync status={streamerStatus} />
      <EasterEggs />
      <VisitorSoulLights />
      <Navigation 
        onSnowToggle={() => setWeatherEnabled(!weatherEnabled)} 
        snowEnabled={weatherEnabled}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
      />
      <HeroSection />
      <StreamSection />
      <AboutSection />
      <ScheduleSection />
      <VODSection />
      <KickSubscribersSection />
      <ContentIdeasSection />
      <MemoryWall />
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
