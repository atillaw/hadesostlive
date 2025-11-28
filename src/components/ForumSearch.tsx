import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, User, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchResult {
  id: string;
  title?: string;
  content: string;
  author_username: string;
  created_at: string;
  type: "post" | "comment" | "user";
  community_slug?: string;
}

interface ForumSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ForumSearch = ({ open, onOpenChange }: ForumSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "users">("posts");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const searchQuery = `%${query}%`;

    if (activeTab === "posts") {
      const { data } = await supabase
        .from("posts")
        .select(`
          id,
          title,
          content,
          author_username,
          created_at,
          community_id,
          communities!inner(slug)
        `)
        .or(`title.ilike.${searchQuery},content.ilike.${searchQuery}`)
        .eq("is_deleted", false)
        .limit(20);

      if (data) {
        setResults(
          data.map((post: any) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            author_username: post.author_username,
            created_at: post.created_at,
            type: "post" as const,
            community_slug: post.communities.slug,
          }))
        );
      }
    } else if (activeTab === "comments") {
      const { data } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          author_username,
          created_at,
          post_id,
          posts!inner(
            community_id,
            communities!inner(slug)
          )
        `)
        .ilike("content", searchQuery)
        .eq("is_deleted", false)
        .limit(20);

      if (data) {
        setResults(
          data.map((comment: any) => ({
            id: comment.id,
            content: comment.content,
            author_username: comment.author_username,
            created_at: comment.created_at,
            type: "comment" as const,
            community_slug: comment.posts.communities.slug,
          }))
        );
      }
    } else {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, email, created_at")
        .ilike("username", searchQuery)
        .limit(20);

      if (data) {
        setResults(
          data.map((user) => ({
            id: user.id,
            content: user.email,
            author_username: user.username,
            created_at: user.created_at,
            type: "user" as const,
          }))
        );
      }
    }

    setLoading(false);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "post") {
      navigate(`/c/${result.community_slug}/post/${result.id}`);
    } else if (result.type === "comment") {
      navigate(`/c/${result.community_slug}/post/${result.id}`);
    } else if (result.type === "user") {
      navigate(`/u/${result.author_username}`);
    }
    onOpenChange(false);
    setQuery("");
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Forum'da Ara</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Ara
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">
              <FileText className="h-4 w-4 mr-2" />
              Gönderiler
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="h-4 w-4 mr-2" />
              Yorumlar
            </TabsTrigger>
            <TabsTrigger value="users">
              <User className="h-4 w-4 mr-2" />
              Kullanıcılar
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[50vh]">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Aranıyor...
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result) => (
                  <Card
                    key={result.id}
                    className="p-4 cursor-pointer hover:border-primary transition-all"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {result.type === "post" && <FileText className="h-5 w-5 text-primary" />}
                        {result.type === "comment" && <MessageSquare className="h-5 w-5 text-blue-500" />}
                        {result.type === "user" && <User className="h-5 w-5 text-green-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        {result.title && (
                          <h3 className="font-semibold mb-1 truncate">{result.title}</h3>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {result.content}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>u/{result.author_username}</span>
                          {result.community_slug && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary">c/{result.community_slug}</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8 text-muted-foreground">
                Sonuç bulunamadı
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aramak için bir şeyler yazın
              </div>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ForumSearch;
