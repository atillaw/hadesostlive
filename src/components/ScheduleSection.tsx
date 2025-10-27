import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

const ScheduleSection = () => {
  const schedule = [
    { day: "Pazartesi", time: "08:30 PM", game: "Just Chatting" },
    { day: "Salı", time: "08:30 PM", game: "Just Chatting" },
    { day: "Çarşamba", time: "08:30 PM", game: "Just Chatting" },
    { day: "Perşembe", time: "08:30 PM", game: "Just Chatting" },
  ];

  return (
    <section className="py-16 md:py-24 container mx-auto px-4 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-text">
            Yayın Akışı
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Beni bu saatlerde canlı yakalayabilirsin (değişebilir).
          </p>
        </div>
        
        <div className="grid gap-4">
          {schedule.map((slot, index) => (
            <Card 
              key={index}
              className="group p-6 border-primary/30 hover:border-primary/60 transition-all duration-300 card-glow bg-card/50 backdrop-blur-sm animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="min-w-[100px] font-bold text-primary text-lg">
                    {slot.day}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5 group-hover:text-primary transition-colors" />
                    <span className="font-medium">{slot.time}</span>
                  </div>
                </div>
                <div className="text-foreground font-semibold text-lg">
                  {slot.game}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-8 animate-slide-up">
          ⏰ Saatler yaklaşık olarak verilmiştir. Canlı bildirimler için sosyal medyadan takip et!
        </p>
      </div>
    </section>
  );
};

export default ScheduleSection;
