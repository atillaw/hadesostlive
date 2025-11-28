import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const MaintenanceCheck = ({ children }: { children: React.ReactNode }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkMaintenanceAndAuth();
  }, [location.pathname]);

  const checkMaintenanceAndAuth = async () => {
    try {
      // Check maintenance mode
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();

      const isMaintenance = settingsData?.value === true || settingsData?.value === "true";
      setMaintenanceMode(isMaintenance);

      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      let adminCheck = false;
      
      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["admin", "super_admin"]);

        adminCheck = !!roleData && roleData.length > 0;
        setIsAdmin(adminCheck);
      }

      // Redirect logic
      if (isMaintenance) {
        // Site bakımda
        if (location.pathname === "/maintenance") {
          // Zaten bakım sayfasında
          setLoading(false);
          return;
        }
        
        if (location.pathname.startsWith("/admin")) {
          // Admin panel erişimi - sadece adminler girebilir
          if (adminCheck) {
            setLoading(false);
            return;
          } else {
            navigate("/maintenance");
            return;
          }
        }
        
        // Diğer tüm sayfalar için bakıma yönlendir (admin değilse)
        if (!adminCheck) {
          navigate("/maintenance");
          return;
        }
      } else {
        // Site normal modda
        if (location.pathname === "/maintenance") {
          navigate("/");
          return;
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Maintenance check error:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};