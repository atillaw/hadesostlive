import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

const ScheduleSection = () => {
  const schedule = [
    { day: "Monday", time: "7:00 PM - 11:00 PM EST", game: "Just Chatting" },
    { day: "Wednesday", time: "7:00 PM - 11:00 PM EST", game: "Just Chatting" },
    { day: "Friday", time: "8:00 PM - 12:00 AM EST", game: "Just Chatting" },
    { day: "Sunday", time: "3:00 PM - 7:00 PM EST", game: "Just Chatting" },
  ];

  return (
    <section className="py-20 container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Yayın Akışı
          </h2>
          <p className="text-muted-foreground">
            Beni bu saatlerde canlı yakalayabilirsin (değişebilir).
          </p>
        </div>
        
        <div className="grid gap-4">
          {schedule.map((slot, index) => (
            <Card 
              key={index}
              className="p-6 border-primary/20 hover:border-primary/40 transition-all duration-300 card-glow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 font-bold text-primary">
                    {slot.day}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{slot.time}</span>
                  </div>
                </div>
                <div className="text-foreground font-medium">
                  {slot.game}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-8">
       Saatler yaklaşık olarak verilmiştir. Canlı bildirimler için sosyal medyadan takip et!
        </p>
      </div>
    </section>
  );
};

export default ScheduleSection;
