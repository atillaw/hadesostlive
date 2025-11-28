import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { usePageTracking } from "@/hooks/usePageTracking";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MaintenanceCheck } from "@/components/MaintenanceCheck";
import Maintenance from "./pages/Maintenance";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import SupportPage from "./pages/Support";
import Memes from "./pages/Memes";
import UploadMeme from "./pages/UploadMeme";
import Clips from "./pages/Clips";
import UploadClip from "./pages/UploadClip";
import Schedule from "./pages/Schedule";
import VODs from "./pages/VODs";
import Team from "./pages/Team";
import Aboneler from "./pages/Aboneler";
import ImpactPoints from "./pages/ImpactPoints";
import PredictionProfile from "./pages/PredictionProfile";
import Sponsors from "./pages/Sponsors";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import CommunityFeed from "./pages/CommunityFeed";
import Community from "./pages/Community";
import CommunityPosts from "./pages/CommunityPosts";
import CreatePost from "./pages/CreatePost";
import Post from "./pages/Post";
import UserProfile from "./pages/UserProfile";
import Messages from "./pages/Messages";
import FollowingFeed from "./pages/FollowingFeed";
import SavedPosts from "./pages/SavedPosts";
import ForumRules from "./pages/ForumRules";
import UserSettings from "./pages/UserSettings";

const AppContent = () => {
  usePageTracking();
  
  return (
    <Routes>
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/destek" element={<SupportPage />} />
      <Route path="/aboneler" element={<Aboneler />} />
      <Route path="/memeler" element={<Memes />} />
      <Route path="/yukle" element={<UploadMeme />} />
      <Route path="/klipler" element={<Clips />} />
      <Route path="/klip-yukle" element={<UploadClip />} />
      <Route path="/yayin-akisi" element={<Schedule />} />
      <Route path="/vodlar" element={<VODs />} />
      <Route path="/takima-katil" element={<Team />} />
      <Route path="/impact-points" element={<ImpactPoints />} />
      <Route path="/tahmin-gecmisi" element={<PredictionProfile />} />
      <Route path="/topluluk" element={<Community />} />
      <Route path="/sponsorlar" element={<Sponsors />} />
      <Route path="/gizlilik-politikasi" element={<PrivacyPolicy />} />
      <Route path="/kullanim-kosullari" element={<TermsOfService />} />
      <Route path="/cerez-politikasi" element={<CookiePolicy />} />
      <Route path="/forum" element={<CommunityFeed />} />
      <Route path="/c/:slug" element={<CommunityPosts />} />
      <Route path="/c/:slug/new" element={<CreatePost />} />
      <Route path="/c/:slug/create" element={<CreatePost />} />
      <Route path="/c/:slug/post/:postId" element={<Post />} />
      <Route path="/u/:username" element={<UserProfile />} />
      <Route path="/mesajlar" element={<Messages />} />
      <Route path="/takip-akisi" element={<FollowingFeed />} />
      <Route path="/kaydedilenler" element={<SavedPosts />} />
      <Route path="/forum-kurallari" element={<ForumRules />} />
      <Route path="/ayarlar" element={<UserSettings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
