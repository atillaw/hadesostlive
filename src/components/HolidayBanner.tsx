import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HOLIDAYS } from "@/types/holidays";
import ataturkImage from "@/assets/ataturk-memorial.png";
import image23Nisan from "@/assets/holidays/23-nisan.png";
import image1Mayis from "@/assets/holidays/1-mayis.png";
import image19Mayis from "@/assets/holidays/19-mayis.png";
import image15Temmuz from "@/assets/holidays/15-temmuz.png";
import image30Agustos from "@/assets/holidays/30-agustos.png";
import image29Ekim from "@/assets/holidays/29-ekim.png";
import imageRamazan from "@/assets/holidays/ramazan.png";
import imageKurban from "@/assets/holidays/kurban.png";

const HOLIDAY_IMAGES: Record<string, string> = {
  'ataturk_memorial': ataturkImage,
  'holiday_23_nisan': image23Nisan,
  'holiday_1_mayis': image1Mayis,
  'holiday_19_mayis': image19Mayis,
  'holiday_15_temmuz': image15Temmuz,
  'holiday_30_agustos': image30Agustos,
  'holiday_29_ekim': image29Ekim,
  'holiday_ramazan': imageRamazan,
  'holiday_kurban': imageKurban,
};

const HolidayBanner = () => {
  const [activeHoliday, setActiveHoliday] = useState<string | null>(null);

  useEffect(() => {
    const checkActiveHoliday = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', HOLIDAYS.map(h => h.key));
      
      if (data) {
        const active = data.find(setting => setting.value === true);
        setActiveHoliday(active?.key || null);
      }
    };

    checkActiveHoliday();
    
    // Subscribe to changes
    const channel = supabase
      .channel('holiday-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings',
          filter: `key=in.(${HOLIDAYS.map(h => h.key).join(',')})`
        },
        (payload: any) => {
          if (payload.new.value === true) {
            setActiveHoliday(payload.new.key);
          } else if (payload.new.key === activeHoliday) {
            setActiveHoliday(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeHoliday]);

  if (!activeHoliday) return null;

  const holiday = HOLIDAYS.find(h => h.key === activeHoliday);
  if (!holiday) return null;

  const isAtaturk = holiday.key === 'ataturk_memorial';

  return (
    <div className="w-full bg-gradient-to-b from-black/95 to-black/80 py-8 relative overflow-hidden animate-fade-in">
      {/* Subtle pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Holiday Image */}
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full animate-pulse" />
            <img 
              src={HOLIDAY_IMAGES[holiday.key]} 
              alt={holiday.name}
              className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full opacity-90 relative z-10 border-2 border-white/20 hover:scale-110 transition-transform duration-300"
            />
          </div>

          {/* Holiday Text */}
          <div className="text-center space-y-3 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
            <h2 className="text-2xl md:text-4xl font-bold text-white tracking-wide hover:scale-105 transition-transform duration-300">
              {holiday.title}
            </h2>
            {holiday.subtitle && (
              <p className="text-xl md:text-2xl text-white/90 font-light">
                {holiday.subtitle}
              </p>
            )}
            {isAtaturk && holiday.dates && (
              <div className="flex items-center justify-center space-x-3 text-white/90">
                <span className="text-xl md:text-2xl font-light">1881</span>
                <span className="text-2xl md:text-3xl">-</span>
                <span className="text-xl md:text-2xl font-light">193<span className="inline-block text-3xl md:text-4xl">∞</span></span>
              </div>
            )}
          </div>

          {/* Decorative line */}
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }} />
        </div>
      </div>
    </div>
  );
};

export default HolidayBanner;
