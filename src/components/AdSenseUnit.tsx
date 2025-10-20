import { useEffect } from "react";

interface AdSenseUnitProps {
  client: string;
  slot: string;
  format?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const AdSenseUnit = ({
  client,
  slot,
  format = "auto",
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = ""
}: AdSenseUnitProps) => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense reklamı yüklenemedi:", e);
    }
  }, []);

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
