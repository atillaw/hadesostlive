import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Calendar, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

const CommunityVoting = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newProposal, setNewProposal] = useState({ title: "", description: "" });
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set());
  const [userIdentifier, setUserIdentifier] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get or create user identifier
    const storedId = localStorage.getItem("voting_user_id");
    if (storedId) {
      setUserIdentifier(storedId);
    } else {
      const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("voting_user_id", newId);
      setUserIdentifier(newId);
    }

    loadProposals();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    if (userIdentifier) {
      loadUserVotes();
    }
  }, [userIdentifier]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('community_proposals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_proposals' }, 
        () => loadProposals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadProposals = async () => {
    const { data, error } = await supabase
      .from('community_proposals')
      .select('*')
      .order('votes', { ascending: false });

    if (error) {
      console.error('Error loading proposals:', error);
    } else {
      setProposals((data || []) as Proposal[]);
    }
    setLoading(false);
  };

  const loadUserVotes = async () => {
    const { data } = await supabase
      .from('proposal_votes')
      .select('proposal_id')
      .eq('user_identifier', userIdentifier);

    if (data) {
      setVotedProposals(new Set(data.map(v => v.proposal_id)));
    }
  };

  const handleVote = async (proposalId: string) => {
    if (votedProposals.has(proposalId)) {
      toast({
        title: "Zaten Oy Verdin",
        description: "Bu öneri için zaten oy kullandın.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert vote
      const { error: voteError } = await supabase
        .from('proposal_votes')
        .insert({ proposal_id: proposalId, user_identifier: userIdentifier });

      if (voteError) throw voteError;

      // Increment vote count
      const proposal = proposals.find(p => p.id === proposalId);
      if (proposal) {
        const { error: updateError } = await supabase
          .from('community_proposals')
          .update({ votes: proposal.votes + 1 })
          .eq('id', proposalId);

        if (updateError) throw updateError;
      }

      setVotedProposals((prev) => new Set([...prev, proposalId]));
      
      toast({
        title: "Oy Kaydedildi!",
        description: "Önerine destek verdin.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Oy kaydedilemedi.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitProposal = async () => {
    if (!newProposal.title.trim() || !newProposal.description.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm alanları doldur.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('community_proposals')
        .insert({
          title: newProposal.title.trim(),
          description: newProposal.description.trim(),
          author: userIdentifier,
          status: 'voting',
          votes: 0
        });

      if (error) throw error;

      setNewProposal({ title: "", description: "" });

      toast({
        title: "Öneri Oluşturuldu!",
        description: "Öneriniz topluluğun oylamasına sunuldu.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Öneri oluşturulamadı.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

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
        {proposals.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Henüz öneri yok. İlk öneriyi sen oluştur!</p>
          </Card>
        ) : (
          proposals.map((proposal) => (
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
                    {new Date(proposal.created_at).toLocaleDateString('tr-TR')}
                  </p>
                  {proposal.scheduled_date && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Calendar className="h-4 w-4" />
                      Tarih: {new Date(proposal.scheduled_date).toLocaleDateString("tr-TR")}
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
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityVoting;
