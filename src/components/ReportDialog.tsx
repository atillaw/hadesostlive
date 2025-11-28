import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReportDialogProps {
  targetId: string;
  targetType: "post" | "comment";
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam veya gereksiz içerik" },
  { value: "harassment", label: "Hakaret veya taciz" },
  { value: "inappropriate", label: "Uygunsuz içerik" },
  { value: "misinformation", label: "Yanlış bilgi" },
  { value: "violence", label: "Şiddet veya tehdit" },
  { value: "other", label: "Diğer" },
];

const ReportDialog = ({ targetId, targetType }: ReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Sebep seçin",
        description: "Lütfen bir rapor sebebi seçin",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const reportData: any = {
        target_id: targetId,
        target_type: targetType,
        reason,
        description: description || null,
        status: "pending",
      };

      if (user) {
        reportData.reporter_id = user.id;
      } else {
        // Anonymous report - generate identifier
        reportData.reporter_identifier = `anon_${Date.now()}`;
      }

      const { error } = await supabase
        .from("reports")
        .insert(reportData);

      if (error) throw error;

      toast({
        title: "Rapor gönderildi",
        description: "Raporunuz moderatörler tarafından incelenecektir",
      });

      setOpen(false);
      setReason("");
      setDescription("");
    } catch (error) {
      console.error("Report submission error:", error);
      toast({
        title: "Hata",
        description: "Rapor gönderilirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Rapor Et
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>İçeriği Rapor Et</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Rapor Sebebi</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama (İsteğe bağlı)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ek detaylar ekleyin..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !reason}>
            {submitting ? "Gönderiliyor..." : "Rapor Gönder"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
