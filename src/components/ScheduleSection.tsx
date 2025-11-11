import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Bell, BellOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ScheduleItem {
  id: string;
  scheduled_date: string;
  title: string;
  description: string | null;
  category: string;
  is_active: boolean;
}

const ScheduleSection = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [reminders, setReminders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const getUserIdentifier = () => {
    let userId = localStorage.getItem("user_id");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("user_id", userId);
    }
    return userId;
  };

  useEffect(() => {
    loadSchedule();
    loadReminders();
  }, []);

  const loadSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from("stream_schedule")
        .select("*")
        .eq("is_active", true)
        .gte("scheduled_date", new Date().toISOString())
        .order("scheduled_date", { ascending: true })
        .limit(10);

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const userId = getUserIdentifier();
      const { data, error } = await supabase
        .from("stream_reminders")
        .select("schedule_id")
        .eq("user_identifier", userId);

      if (error) throw error;
      setReminders(new Set(data?.map(r => r.schedule_id) || []));
    } catch (error) {
      console.error("Error loading reminders:", error);
    }
  };

  const toggleReminder = async (scheduleId: string) => {
    const userId = getUserIdentifier();
    const hasReminder = reminders.has(scheduleId);

    try {
      if (hasReminder) {
        const { error } = await supabase
          .from("stream_reminders")
          .delete()
          .eq("schedule_id", scheduleId)
          .eq("user_identifier", userId);

        if (error) throw error;

        setReminders(prev => {
          const newSet = new Set(prev);
          newSet.delete(scheduleId);
          return newSet;
        });

        toast({
          title: "Hatırlatıcı Kaldırıldı",
          description: "Yayın hatırlatıcısı kaldırıldı.",
        });
      } else {
        const { error } = await supabase
          .from("stream_reminders")
          .insert({
            schedule_id: scheduleId,
            user_identifier: userId,
          });

        if (error) throw error;

        setReminders(prev => new Set(prev).add(scheduleId));

        // Request notification permission if not granted
        if ("Notification" in window && Notification.permission === "default") {
          await Notification.requestPermission();
        }

        toast({
          title: "✅ Hatırlatıcı Ayarlandı",
          description: "Yayın başlamadan önce bildirim alacaksınız!",
        });
      }
    } catch (error) {
      console.error("Error toggling reminder:", error);
      toast({
        title: "Hata",
        description: "Hatırlatıcı ayarlanırken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <section id="schedule" className="py-16 md:py-24 container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Yayın Takvimi</h2>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="schedule" className="py-16 md:py-24 container mx-auto px-4 animate-fade-in scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">
            Yayın Takvimi
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Yaklaşan yayınları keşfet ve hatırlatıcı kur!
          </p>
        </div>
        
        {schedule.length === 0 ? (
          <Card className="p-12 text-center border-primary/30">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              Şu anda planlanmış yayın yok.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {schedule.map((slot, index) => (
              <Card 
                key={slot.id}
                className="group p-6 border-primary/30 hover:border-primary/60 transition-all duration-300 card-glow bg-card/50 backdrop-blur-sm animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-xl text-primary">
                      {slot.title}
                    </h3>
                    {slot.description && (
                      <p className="text-muted-foreground text-sm">
                        {slot.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(slot.scheduled_date), "d MMMM yyyy, EEEE", { locale: tr })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 group-hover:text-primary transition-colors" />
                        <span className="font-medium">
                          {format(new Date(slot.scheduled_date), "HH:mm")}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {slot.category}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => toggleReminder(slot.id)}
                    variant={reminders.has(slot.id) ? "default" : "outline"}
                    className="shrink-0"
                  >
                    {reminders.has(slot.id) ? (
                      <>
                        <BellOff className="w-4 h-4 mr-2" />
                        Hatırlatıcı Kaldır
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        Hatırlat
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        <p className="text-center text-sm text-muted-foreground mt-8 animate-slide-up">
          🔔 Hatırlatıcı kurarak yayın başlamadan önce bildirim alabilirsin!
        </p>
      </div>
    </section>
  );
};

export default ScheduleSection;
