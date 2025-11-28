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
  Flag
} from "lucide-react";
import { NavLink } from "react-router-dom";
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

interface AdminSidebarProps {
  userRole: string | null;
  onTabChange: (value: string) => void;
  activeTab: string;
}

const menuItems = [
  { id: "analytics", title: "Analytics", icon: BarChart3 },
  { id: "security-logs", title: "Güvenlik Logları", icon: Shield },
  { id: "clock", title: "Saat", icon: Clock },
  { id: "countdown", title: "Geri Sayım", icon: Timer },
  { id: "holiday-banners", title: "Bayram Banner'ları", icon: Heart },
  { id: "subscribers", title: "Aboneler", icon: Mail },
  { id: "vods", title: "VODs", icon: Video },
  { id: "vod-tags", title: "VOD Etiketleri", icon: Tag },
  { id: "kick-subs", title: "Kick Subs", icon: TrendingUp },
  { id: "support", title: "Destek", icon: MessageCircle },
  { id: "adsense", title: "AdSense", icon: Megaphone },
  { id: "ad-placements", title: "Reklam Yerleri", icon: MapPin },
  { id: "ad-performance", title: "Reklam Performansı", icon: TrendingUp },
  { id: "memes", title: "Memeler", icon: ImageIcon },
  { id: "clips", title: "Klipler", icon: Film },
  { id: "community-voting", title: "Topluluk Önerileri", icon: Vote },
  { id: "prediction-games", title: "Tahmin Oyunları", icon: Target },
  { id: "mini-games", title: "Mini Oyunlar", icon: Gamepad2 },
  { id: "sponsors", title: "Sponsorlar", icon: Award },
  { id: "forum", title: "Forum", icon: MessageSquare },
  { id: "moderators", title: "Moderatörler", icon: Shield },
  { id: "reports", title: "Raporlar", icon: Flag },
  { id: "logs", title: "Loglar", icon: ScrollText },
];

export function AdminSidebar({ userRole, onTabChange, activeTab }: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Forum moderators only have access to forum and moderators tabs
  const forumModItems = [
    { id: "forum", title: "Forum", icon: MessageSquare },
    { id: "moderators", title: "Moderatörler", icon: Shield },
    { id: "reports", title: "Raporlar", icon: Flag },
  ];

  const displayItems = userRole === "forum_mod" ? forumModItems : menuItems;

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold">
            {!isCollapsed && (userRole === "forum_mod" ? "Forum Yönetimi" : "Yönetim Paneli")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {displayItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={
                      activeTab === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/50"
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {userRole === "admin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onTabChange("users")}
                    className={
                      activeTab === "users"
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/50"
                    }
                  >
                    <Users className="h-4 w-4" />
                    {!isCollapsed && <span>Kullanıcılar</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
