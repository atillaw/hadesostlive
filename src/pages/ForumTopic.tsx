import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowUp, ArrowDown, Reply, Flag, Edit, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Entry {
  id: string;
  author_username: string;
  is_anonymous: boolean;
  content: string;
  vote_score: number;
  created_at: string;
  is_edited: boolean;
  author_id: string | null;
}

interface Topic {
  id: string;
  title: string;
  author_username: string;
  is_anonymous: boolean;
  is_locked: boolean;
  category_id: string;
}

const ForumTopic = () => {
  const { slug } = useParams<{ slug: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      loadTopic();
      incrementViewCount();
    }
  }, [slug]);

  const incrementViewCount = async () => {
    const { data: topicData } = await supabase
      .from("forum_topics")
      .select("id, view_count")
      .eq("slug", slug)
      .single();

    if (topicData) {
      await supabase
        .from("forum_topics")
        .update({ view_count: topicData.view_count + 1 })
        .eq("id", topicData.id);
    }
  };

  const loadTopic = async () => {
    try {
      const { data: topicData, error: topicError } = await supabase
        .from("forum_topics")
        .select("*")
        .eq("slug", slug)
        .single();

      if (topicError) throw topicError;
      setTopic(topicData);

      const { data: entriesData, error: entriesError } = await supabase
        .from("forum_entries")
        .select("*")
        .eq("topic_id", topicData.id)
        .eq("is_deleted", false)
        .order("created_at");

      if (entriesError) throw entriesError;
      setEntries(entriesData || []);
    } catch (error) {
      console.error("Konu yüklenemedi:", error);
      toast({
        title: "Hata",
        description: "Konu yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEntry = async () => {
    if (!newEntry.trim() || !topic) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let username = "Misafir";
      if (user && !isAnonymous) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        username = profile?.username || user.email?.split("@")[0] || "Kullanıcı";
      }

      const { error } = await supabase.from("forum_entries").insert({
        topic_id: topic.id,
        author_id: user?.id || null,
        author_username: username,
        is_anonymous: isAnonymous || !user,
        content: newEntry,
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Gönderi eklendi",
      });
      setNewEntry("");
      loadTopic();
    } catch (error) {
      console.error("Gönderi eklenemedi:", error);
      toast({
        title: "Hata",
        description: "Gönderi eklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (entryId: string, voteType: 1 | -1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userIdentifier = user?.id || localStorage.getItem("user_identifier") || 
        `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!user) {
        localStorage.setItem("user_identifier", userIdentifier);
      }

      const { data: existingVote } = await supabase
        .from("forum_votes")
        .select("id, vote_type")
        .eq("entry_id", entryId)
        .eq(user ? "user_id" : "user_identifier", userIdentifier)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          await supabase.from("forum_votes").delete().eq("id", existingVote.id);
        } else {
          await supabase.from("forum_votes")
            .update({ vote_type: voteType })
            .eq("id", existingVote.id);
        }
      } else {
        await supabase.from("forum_votes").insert({
          entry_id: entryId,
          user_id: user?.id || null,
          user_identifier: user ? null : userIdentifier,
          vote_type: voteType,
        });
      }

      loadTopic();
    } catch (error) {
      console.error("Oy kullanılamadı:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-12 w-full mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Konu bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/forum">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Foruma Dön
          </Link>
        </Button>

        <Card className="p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{topic.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{topic.is_anonymous ? "Anonim" : topic.author_username}</span>
          </div>
        </Card>

        <div className="space-y-4 mb-8">
          {entries.map((entry, index) => (
            <Card key={entry.id} className="p-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleVote(entry.id, 1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <span className="font-bold">{entry.vote_score}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleVote(entry.id, -1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold">
                      {entry.is_anonymous ? "Anonim" : entry.author_username}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </span>
                    {entry.is_edited && (
                      <Badge variant="outline" className="text-xs">Düzenlendi</Badge>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!topic.is_locked && (
          <Card className="p-6">
            <h3 className="font-bold mb-4">Yanıt Yaz</h3>
            <Textarea
              placeholder="Düşüncelerinizi paylaşın..."
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              rows={6}
              className="mb-4"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                />
                <Label htmlFor="anonymous">Anonim gönder</Label>
              </div>
              <Button onClick={handleSubmitEntry} disabled={submitting || !newEntry.trim()}>
                {submitting ? "Gönderiliyor..." : "Gönder"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ForumTopic;
