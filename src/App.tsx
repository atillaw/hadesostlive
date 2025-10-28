import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { usePageTracking } from "@/hooks/usePageTracking";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import SupportPage from "./pages/Support";
import Memes from "./pages/Memes";
import UploadMeme from "./pages/UploadMeme";
import Clips from "./pages/Clips";
import UploadClip from "./pages/UploadClip";
import Chat from "./pages/Chat";
import Schedule from "./pages/Schedule";
import VODs from "./pages/VODs";
import Subscribe from "./pages/Subscribe";
import Team from "./pages/Team";
import Social from "./pages/Social";


const AppContent = () => {
  usePageTracking();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/destek" element={<SupportPage />} />
      <Route path="/memeler" element={<Memes />} />
      <Route path="/yukle" element={<UploadMeme />} />
      <Route path="/sohbet" element={<Chat />} />
      <Route path="/klipler" element={<Clips />} />
      <Route path="/klip-yukle" element={<UploadClip />} />
      <Route path="/yayin-akisi" element={<Schedule />} />
      <Route path="/vodlar" element={<VODs />} />
      <Route path="/haberdar-ol" element={<Subscribe />} />
      <Route path="/takima-katil" element={<Team />} />
      <Route path="/topluluklar" element={<Social />} />
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
