import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, ThumbsUp, Calendar, Edit, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Proposal {
  id: string;
  title: string;
  description: string;
  votes: number;
  author: string;
  status: "voting" | "accepted" | "scheduled" | "rejected";
  scheduled_date?: string;
  created_at: string;
}

const AdminCommunityVoting = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadProposals();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin_proposals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_proposals' }, 
        () => loadProposals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadProposals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_proposals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Hata",
        description: "Öneriler yüklenemedi.",
        variant: "destructive",
      });
    } else {
      setProposals((data || []) as Proposal[]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu öneriyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    const { error } = await supabase
      .from("community_proposals")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Hata",
        description: "Öneri silinemedi.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Silindi",
        description: "Öneri başarıyla silindi.",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProposal) return;

    const { error } = await supabase
      .from("community_proposals")
      .update({
        title: editingProposal.title,
        description: editingProposal.description,
        status: editingProposal.status,
        scheduled_date: editingProposal.scheduled_date || null,
      })
      .eq("id", editingProposal.id);

    if (error) {
      toast({
        title: "Hata",
        description: "Öneri güncellenemedi.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Güncellendi",
        description: "Öneri başarıyla güncellendi.",
      });
      setIsDialogOpen(false);
      setEditingProposal(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "default";
      case "scheduled":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "voting":
        return "Oylama";
      case "accepted":
        return "Kabul Edildi";
      case "scheduled":
        return "Planlandı";
      case "rejected":
        return "Reddedildi";
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Topluluk Önerileri</h2>
          <p className="text-muted-foreground">Toplam {proposals.length} öneri</p>
        </div>
        <Button onClick={loadProposals}>Yenile</Button>
      </div>

      {proposals.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Henüz öneri yok</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{proposal.title}</h3>
                    <Badge variant={getStatusBadgeVariant(proposal.status)}>
                      {getStatusLabel(proposal.status)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{proposal.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Öneren: {proposal.author}</span>
                    <span>
                      Tarih: {new Date(proposal.created_at).toLocaleDateString("tr-TR")}
                    </span>
                    {proposal.scheduled_date && (
                      <div className="flex items-center gap-1 text-primary">
                        <Calendar className="h-4 w-4" />
                        Planlanan: {new Date(proposal.scheduled_date).toLocaleDateString("tr-TR")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10">
                    <ThumbsUp className="h-4 w-4 text-primary" />
                    <span className="font-bold text-primary">{proposal.votes}</span>
                  </div>

                  <Dialog open={isDialogOpen && editingProposal?.id === proposal.id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setEditingProposal(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingProposal(proposal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Öneriyi Düzenle</DialogTitle>
                        <DialogDescription>
                          Öneri bilgilerini güncelleyin ve durumunu değiştirin.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Başlık</Label>
                          <Input
                            id="title"
                            value={editingProposal?.title || ""}
                            onChange={(e) =>
                              setEditingProposal(prev =>
                                prev ? { ...prev, title: e.target.value } : null
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Açıklama</Label>
                          <Textarea
                            id="description"
                            value={editingProposal?.description || ""}
                            onChange={(e) =>
                              setEditingProposal(prev =>
                                prev ? { ...prev, description: e.target.value } : null
                              )
                            }
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">Durum</Label>
                          <Select
                            value={editingProposal?.status || "voting"}
                            onValueChange={(value: any) =>
                              setEditingProposal(prev =>
                                prev ? { ...prev, status: value } : null
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="voting">Oylama</SelectItem>
                              <SelectItem value="accepted">Kabul Edildi</SelectItem>
                              <SelectItem value="scheduled">Planlandı</SelectItem>
                              <SelectItem value="rejected">Reddedildi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(editingProposal?.status === "scheduled" || editingProposal?.status === "accepted") && (
                          <div className="space-y-2">
                            <Label htmlFor="scheduled_date">Planlanan Tarih (İsteğe bağlı)</Label>
                            <Input
                              id="scheduled_date"
                              type="date"
                              value={editingProposal?.scheduled_date?.split('T')[0] || ""}
                              onChange={(e) =>
                                setEditingProposal(prev =>
                                  prev ? { ...prev, scheduled_date: e.target.value } : null
                                )
                              }
                            />
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false);
                              setEditingProposal(null);
                            }}
                          >
                            İptal
                          </Button>
                          <Button type="submit">Kaydet</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(proposal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommunityVoting;
