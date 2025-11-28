import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CommunityMembershipProps {
  communityId: string;
  communityName: string;
}

export const CommunityMembership = ({ communityId, communityName }: CommunityMembershipProps) => {
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkMembership();
  }, [communityId]);

  const checkMembership = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setChecking(false);
        return;
      }

      const { data } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .maybeSingle();

      setIsMember(!!data);
    } catch (error) {
      console.error("Membership check error:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleToggleMembership = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Topluluğa katılmak için giriş yapmalısınız");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      if (isMember) {
        // Leave community
        const { error } = await supabase
          .from("community_members")
          .delete()
          .eq("community_id", communityId)
          .eq("user_id", user.id);

        if (error) throw error;

        setIsMember(false);
        toast.success(`${communityName} topluluğundan ayrıldınız`);
      } else {
        // Join community
        const { error } = await supabase
          .from("community_members")
          .insert({
            community_id: communityId,
            user_id: user.id,
          });

        if (error) throw error;

        setIsMember(true);
        toast.success(`${communityName} topluluğuna katıldınız!`);
      }
    } catch (error: any) {
      console.error("Membership toggle error:", error);
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Yükleniyor...
      </Button>
    );
  }

  return (
    <Button
      onClick={handleToggleMembership}
      disabled={loading}
      variant={isMember ? "outline" : "default"}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isMember ? (
        <>
          <UserMinus className="h-4 w-4" />
          Ayrıl
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Katıl
        </>
      )}
    </Button>
  );
};