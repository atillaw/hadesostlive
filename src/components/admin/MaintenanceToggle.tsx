import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const MaintenanceToggle = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMaintenanceStatus();
  }, []);

  const loadMaintenanceStatus = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .single();

    if (data) {
      setMaintenanceMode(data.value === "true" || data.value === true);
    }
  };

  const toggleMaintenance = async () => {
    setLoading(true);
    try {
      const newValue = !maintenanceMode;
      
      const { error } = await supabase
        .from("site_settings")
        .update({ value: newValue })
        .eq("key", "maintenance_mode");

      if (error) throw error;

      setMaintenanceMode(newValue);
      toast.success(
        newValue ? "Site bakım moduna alındı" : "Bakım modu kapatıldı"
      );

      // Reload page after 1 second to apply changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Maintenance toggle error:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={maintenanceMode ? "destructive" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Construction className="h-4 w-4" />
          {maintenanceMode ? "Bakımı Kapat" : "Bakıma Al"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {maintenanceMode ? "Bakım Modunu Kapat" : "Siteyi Bakıma Al"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {maintenanceMode
              ? "Site tekrar normal kullanıma açılacak. Emin misiniz?"
              : "Site bakım moduna alınacak ve sadece admin paneli erişilebilir olacak. Emin misiniz?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={toggleMaintenance} disabled={loading}>
            {loading ? "İşleniyor..." : "Onayla"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};