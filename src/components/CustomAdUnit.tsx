import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CustomAdUnitProps {
  className?: string;
}

const CustomAdUnit = ({ className = "" }: CustomAdUnitProps) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState("");
  const impressionTracked = useRef(false);

  // Track ad impression
  const trackImpression = async () => {
    if (impressionTracked.current || !htmlContent) return;
    impressionTracked.current = true;
    
    try {
      const userIdentifier = localStorage.getItem("user_identifier") || 
        `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await supabase.from("ad_performance").insert({
        page_path: location.pathname,
        ad_type: "custom_html",
        event_type: "impression",
        user_identifier: userIdentifier
      });
    } catch (error) {
      console.error("Error tracking ad impression:", error);
    }
  };

  useEffect(() => {
    loadCustomAdHtml();
  }, []);

  useEffect(() => {
    if (htmlContent) {
      trackImpression();
    }
  }, [htmlContent]);

  const loadCustomAdHtml = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "custom_ad_html")
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        const settings = data.value as { html: string };
        setHtmlContent(settings.html || "");
      }
    } catch (error) {
      console.error("Özel reklam HTML yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!htmlContent) {
    return null;
  }

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default CustomAdUnit;
