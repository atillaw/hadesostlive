import { 
  Heart, 
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
  BarChart3
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
  { id: "ideas", title: "Fikirler", icon: Heart },
  { id: "clock", title: "Saat", icon: Clock },
  { id: "countdown", title: "Geri Sayım", icon: Timer },
  { id: "subscribers", title: "Aboneler", icon: Mail },
  { id: "vods", title: "VODs", icon: Video },
  { id: "kick-subs", title: "Kick Subs", icon: TrendingUp },
  { id: "support", title: "Destek", icon: MessageCircle },
  { id: "adsense", title: "AdSense", icon: Megaphone },
  { id: "memes", title: "Memeler", icon: ImageIcon },
  { id: "clips", title: "Klipler", icon: Film },
  { id: "logs", title: "Loglar", icon: ScrollText },
];

export function AdminSidebar({ userRole, onTabChange, activeTab }: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold">
            {!isCollapsed && "Yönetim Paneli"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
