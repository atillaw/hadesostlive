import { 
  Clock, 
  Timer, 
  Mail, 
  Video, 
  TrendingUp, 
  MessageCircle, 
  Megaphone, 
  ImageIcon, 
  Film, 
  ScrollText, 
  Users,
  BarChart3,
  Vote,
  Gamepad2,
  Award,
  MapPin,
  Heart,
  Target,
  Tag,
  Shield,
  MessageSquare,
  Flag,
  ChevronDown,
  Crown
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdminSidebarProps {
  userRole: string | null;
  onTabChange: (value: string) => void;
  activeTab: string;
}

const menuCategories = {
  analytics: {
    label: "📊 Analiz & İstatistik",
    items: [
      { id: "analytics", title: "Genel Analytics", icon: BarChart3 },
      { id: "security-logs", title: "Güvenlik Logları", icon: Shield },
      { id: "logs", title: "Admin Logları", icon: ScrollText },
      { id: "ad-performance", title: "Reklam Performansı", icon: TrendingUp },
    ]
  },
  content: {
    label: "🎬 İçerik Yönetimi",
    items: [
      { id: "vods", title: "VOD'lar", icon: Video },
      { id: "vod-tags", title: "VOD Etiketleri", icon: Tag },
      { id: "memes", title: "Memeler", icon: ImageIcon },
      { id: "clips", title: "Klipler", icon: Film },
    ]
  },
  advertising: {
    label: "💰 Reklam Yönetimi",
    items: [
      { id: "adsense", title: "AdSense", icon: Megaphone },
      { id: "ad-placements", title: "Reklam Yerleri", icon: MapPin },
      { id: "sponsors", title: "Sponsorlar", icon: Award },
    ]
  },
  community: {
    label: "👥 Topluluk & Forum",
    items: [
      { id: "forum", title: "Forum Yönetimi", icon: MessageSquare },
      { id: "moderators", title: "Moderatörler", icon: Shield },
      { id: "reports", title: "Raporlar", icon: Flag },
      { id: "community-voting", title: "Topluluk Önerileri", icon: Vote },
      { id: "banners", title: "Community Banner'lar", icon: Users },
    ]
  },
  engagement: {
    label: "🎮 Etkileşim & Oyunlar",
    items: [
      { id: "prediction-games", title: "Tahmin Oyunları", icon: Target },
      { id: "mini-games", title: "Mini Oyunlar", icon: Gamepad2 },
    ]
  },
  settings: {
    label: "⚙️ Site Ayarları",
    items: [
      { id: "clock", title: "Saat Ayarları", icon: Clock },
      { id: "countdown", title: "Geri Sayım", icon: Timer },
      { id: "holiday-banners", title: "Bayram Banner'ları", icon: Heart },
      { id: "kick-oauth", title: "Kick OAuth", icon: Shield },
    ]
  },
  users: {
    label: "📧 Kullanıcılar & Destek",
    items: [
      { id: "subscribers", title: "Email Aboneleri", icon: Mail },
      { id: "kick-subs", title: "Kick Subs", icon: TrendingUp },
      { id: "kick-dashboard", title: "Kick Dashboard", icon: Crown },
      { id: "support", title: "Destek Mesajları", icon: MessageCircle },
    ]
  }
};

const forumModCategories = {
  community: {
    label: "👥 Forum Yönetimi",
    items: [
      { id: "forum", title: "Forum", icon: MessageSquare },
      { id: "moderators", title: "Moderatörler", icon: Shield },
      { id: "reports", title: "Raporlar", icon: Flag },
    ]
  }
};

export function AdminSidebar({ userRole, onTabChange, activeTab }: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const categories = userRole === "forum_mod" ? forumModCategories : menuCategories;

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-72"} collapsible="icon">
      <SidebarContent className="gap-2">
        {Object.entries(categories).map(([categoryKey, category]) => (
          <Collapsible key={categoryKey} defaultOpen className="group/collapsible">
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="text-sm font-semibold cursor-pointer hover:bg-muted/50 rounded-md px-2 py-2 transition-colors flex items-center justify-between">
                  {!isCollapsed && (
                    <>
                      <span>{category.label}</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </>
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => onTabChange(item.id)}
                          className={
                            activeTab === item.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted/50"
                          }
                          tooltip={isCollapsed ? item.title : undefined}
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
