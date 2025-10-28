import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve a unique user identifier
const getUserIdentifier = () => {
  let identifier = localStorage.getItem("user_identifier");
  if (!identifier) {
    identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("user_identifier", identifier);
  }
  return identifier;
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const userIdentifier = getUserIdentifier();
        await supabase.from("page_views").insert({
          page_path: location.pathname,
          user_identifier: userIdentifier,
        });
      } catch (error) {
        console.error("Error tracking page view:", error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};
