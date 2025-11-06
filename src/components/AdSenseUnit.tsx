import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AdSenseUnitProps {
  client?: string;
  slot?: string;
  format?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const AdSenseUnit = ({
  client: propClient,
  slot: propSlot,
  format = "auto",
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = ""
}: AdSenseUnitProps) => {
  const location = useLocation();
  const [loading, setLoading] = useState(!propClient || !propSlot);
  const [client, setClient] = useState(propClient || "");
  const [slot, setSlot] = useState(propSlot || "");
  const impressionTracked = useRef(false);

  // Track ad impression
  const trackImpression = async () => {
    if (impressionTracked.current) return;
    impressionTracked.current = true;
    
    try {
      const userIdentifier = localStorage.getItem("user_identifier") || 
        `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await supabase.from("ad_performance").insert({
        page_path: location.pathname,
        ad_type: "adsense",
        event_type: "impression",
        user_identifier: userIdentifier,
        ad_slot: slot
      });
    } catch (error) {
      console.error("Error tracking ad impression:", error);
    }
  };

  useEffect(() => {
    if (!propClient || !propSlot) {
      loadAdSenseSettings();
    }
  }, [propClient, propSlot]);

  const loadAdSenseSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "adsense")
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        const settings = data.value as { client: string; slot: string };
        setClient(settings.client || "");
        setSlot(settings.slot || "");
      }
    } catch (error) {
      console.error("AdSense ayarları yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client && slot && !loading) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        trackImpression();
      } catch (e) {
        console.error("AdSense reklamı yüklenemedi:", e);
      }
    }
  }, [client, slot, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client || !slot) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>AdSense ayarları yapılmamış</p>
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  );
};

export default AdSenseUnit;
