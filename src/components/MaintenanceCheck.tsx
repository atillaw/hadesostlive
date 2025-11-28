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
      // Allow access to auth and admin pages without maintenance check
      if (location.pathname === "/auth" || location.pathname.startsWith("/admin")) {
        setLoading(false);
        return;
      }

      // Check maintenance mode
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();

      const isMaintenance = settingsData?.value === true || settingsData?.value === "true";
      setMaintenanceMode(isMaintenance);

      // If maintenance is active and not on maintenance page, redirect
      if (isMaintenance && location.pathname !== "/maintenance") {
        navigate("/maintenance");
        return;
      }
      
      // If maintenance is off and on maintenance page, redirect home
      if (!isMaintenance && location.pathname === "/maintenance") {
        navigate("/");
        return;
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