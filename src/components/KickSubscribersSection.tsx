import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface KickSubscriber {
  id: string;
  username: string;
  subscription_tier: string;
  subscription_type: string | null;
  subscribed_at: string;
}

const KickSubscribersSection = () => {
  const [subscribers, setSubscribers] = useState<KickSubscriber[]>([]);
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  useEffect(() => {
    fetchSubscribers();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('kick-subscribers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kick_subscribers'
        },
        () => {
          fetchSubscribers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSubscribers = async () => {
    const { data, error } = await supabase
      .from('kick_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching subscribers:', error);
      return;
    }

    setSubscribers(data || []);
    setTotalSubscribers(data?.length || 0);
  };

  const getTierColor = (tier: string) => {
    const lowerTier = tier.toLowerCase();
    if (lowerTier.includes('tier 3') || lowerTier.includes('t3')) return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    if (lowerTier.includes('tier 2') || lowerTier.includes('t2')) return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    if (lowerTier.includes('tier 1') || lowerTier.includes('t1')) return 'bg-green-500/20 text-green-300 border-green-500/50';
    if (lowerTier.includes('gift')) return 'bg-pink-500/20 text-pink-300 border-pink-500/50';
    return 'bg-secondary/20 text-secondary border-secondary/50';
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 glow-text">Kick Aboneler</h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-muted-foreground">Aktif Uzun Süreli Aboneler</p>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {totalSubscribers}
            </Badge>
          </div>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 card-glow">
          <CardHeader>
            <CardTitle className="text-xl">Aboneler</CardTitle>
          </CardHeader>
          <CardContent>
            {subscribers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No subscribers yet. Subscriptions will appear here automatically.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-muted/30">
                      <TableHead className="text-foreground font-semibold">Username</TableHead>
                      <TableHead className="text-foreground font-semibold">Seviye</TableHead>
                      <TableHead className="text-foreground font-semibold">Şekil</TableHead>
                      <TableHead className="text-foreground font-semibold">Abone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((subscriber) => (
                      <TableRow 
                        key={subscriber.id}
                        className="border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-medium text-foreground">
                          {subscriber.username}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={getTierColor(subscriber.subscription_tier)}
                          >
                            {subscriber.subscription_tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {subscriber.subscription_type || 'Standard'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(subscriber.subscribed_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default KickSubscribersSection;
