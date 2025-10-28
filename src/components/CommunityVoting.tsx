import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Calendar, Clock, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Proposal {
  id: number;
  title: string;
  description: string;
  votes: number;
  author: string;
  status: "voting" | "accepted" | "scheduled";
  scheduledDate?: string;
}

const CommunityVoting = () => {
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 1,
      title: "Retro Oyun Haftası",
      description: "Bir hafta boyunca sadece 90'lar ve 2000'lerin klasik oyunlarını oynayalım!",
      votes: 234,
      author: "retroFan42",
      status: "voting",
    },
    {
      id: 2,
      title: "Türkçe Oyun Özel Bölümü",
      description: "Türk yapımı indie oyunları keşfedelim ve destekleyelim.",
      votes: 189,
      author: "gameDev_TR",
      status: "voting",
    },
    {
      id: 3,
      title: "24 Saat Maraton Yayını",
      description: "Toplulukla birlikte 24 saat boyunca aralıksız yayın yapalım!",
      votes: 312,
      author: "streamLover",
      status: "accepted",
      scheduledDate: "2025-02-15",
    },
  ]);

  const [newProposal, setNewProposal] = useState({ title: "", description: "" });
  const [votedProposals, setVotedProposals] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const handleVote = (proposalId: number) => {
    if (votedProposals.has(proposalId)) {
      toast({
        title: "Zaten Oy Verdin",
        description: "Bu öneri için zaten oy kullandın.",
        variant: "destructive",
      });
      return;
    }

    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, votes: p.votes + 1 } : p))
    );
    setVotedProposals((prev) => new Set([...prev, proposalId]));

    toast({
      title: "Oy Kaydedildi!",
      description: "Önerine destek verdin.",
    });
  };

  const handleSubmitProposal = () => {
    if (!newProposal.title.trim() || !newProposal.description.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm alanları doldur.",
        variant: "destructive",
      });
      return;
    }

    const proposal: Proposal = {
      id: Date.now(),
      title: newProposal.title,
      description: newProposal.description,
      votes: 0,
      author: "Siz",
      status: "voting",
    };

    setProposals((prev) => [proposal, ...prev]);
    setNewProposal({ title: "", description: "" });

    toast({
      title: "Öneri Oluşturuldu!",
      description: "Öneriniz topluluğun oylamasına sunuldu.",
    });
  };

  const sortedProposals = [...proposals].sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-6">
      {/* Create Proposal */}
      <Card className="p-6 glass border-primary/30">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Yeni Yayın Önerisi</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Başlık</label>
              <Input
                value={newProposal.title}
                onChange={(e) =>
                  setNewProposal({ ...newProposal, title: e.target.value })
                }
                placeholder="Örn: Retro Oyun Haftası"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Açıklama</label>
              <Textarea
                value={newProposal.description}
                onChange={(e) =>
                  setNewProposal({ ...newProposal, description: e.target.value })
                }
                placeholder="Önerinizi detaylı açıklayın..."
                rows={4}
              />
            </div>

            <Button onClick={handleSubmitProposal} className="w-full">
              Öneri Oluştur
            </Button>
          </div>
        </div>
      </Card>

      {/* Active Proposals */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Aktif Öneriler</h2>
        {sortedProposals.map((proposal) => (
          <Card
            key={proposal.id}
            className="p-6 glass border-primary/20 hover:border-primary/50 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">{proposal.title}</h3>
                    <Badge
                      variant={
                        proposal.status === "accepted"
                          ? "default"
                          : proposal.status === "scheduled"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {proposal.status === "voting" && "Oylama"}
                      {proposal.status === "accepted" && "Kabul Edildi"}
                      {proposal.status === "scheduled" && "Planlandı"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{proposal.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Öneren: {proposal.author}
                  </p>
                  {proposal.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Calendar className="h-4 w-4" />
                      Tarih: {new Date(proposal.scheduledDate).toLocaleDateString("tr-TR")}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant={votedProposals.has(proposal.id) ? "secondary" : "outline"}
                    size="lg"
                    onClick={() => handleVote(proposal.id)}
                    disabled={
                      proposal.status !== "voting" || votedProposals.has(proposal.id)
                    }
                    className="flex-col h-auto py-3 px-6"
                  >
                    <ThumbsUp
                      className={`h-6 w-6 ${
                        votedProposals.has(proposal.id) ? "fill-current" : ""
                      }`}
                    />
                    <span className="text-2xl font-bold mt-1">{proposal.votes}</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityVoting;
