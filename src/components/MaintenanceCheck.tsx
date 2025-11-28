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
        .single();

      const isMaintenance = settingsData?.value === "true" || settingsData?.value === true;
      setMaintenanceMode(isMaintenance);

      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      let userRoleData = null;
      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["admin", "super_admin"]);

        userRoleData = roleData;
        setIsAdmin(!!roleData && roleData.length > 0);
      }

      // Redirect logic
      if (isMaintenance && !location.pathname.startsWith("/admin")) {
        if (userRoleData && userRoleData.length > 0) {
          // Admin can access
          setLoading(false);
        } else {
          // Non-admin redirect to maintenance
          navigate("/maintenance");
        }
      } else if (!isMaintenance && location.pathname === "/maintenance") {
        // If maintenance is off but user is on maintenance page, redirect home
        navigate("/");
      } else {
        setLoading(false);
      }
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