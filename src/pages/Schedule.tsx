import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScheduleSection from "@/components/ScheduleSection";

const Schedule = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <ScheduleSection />
      </main>
      <Footer />
    </div>
  );
};

export default Schedule;
