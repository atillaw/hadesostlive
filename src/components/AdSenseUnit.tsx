import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(!propClient || !propSlot);
  const [client, setClient] = useState(propClient || "");
  const [slot, setSlot] = useState(propSlot || "");

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
