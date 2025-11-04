import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CustomAdUnitProps {
  className?: string;
}

const CustomAdUnit = ({ className = "" }: CustomAdUnitProps) => {
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    loadCustomAdHtml();
  }, []);

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
