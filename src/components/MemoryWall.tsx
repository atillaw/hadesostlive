import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StreamMemory {
  id: string;
  date: string;
  highlights: string[];
  messages: string[];
}

const MemoryWall = () => {
  const [memories, setMemories] = useState<StreamMemory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      // Fetch recent VODs as stream memories
      const { data: vods, error } = await supabase
        .from('vods')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      if (vods) {
        const memoryData: StreamMemory[] = vods.map(vod => ({
          id: vod.id,
          date: new Date(vod.created_at).toLocaleDateString('tr-TR'),
          highlights: [vod.title],
          messages: [],
        }));
        setMemories(memoryData);
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 glow-text">
            Yayın Anıları
          </h2>
          <div className="animate-pulse">Yükleniyor...</div>
        </div>
      </section>
    );
  }

  if (memories.length === 0) return null;

  return (
    <section className="py-16 px-4 relative">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 glow-text">
          Yayın Anıları
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <Card 
              key={memory.id} 
              className="snow-accent bg-card/50 backdrop-blur-sm hover:scale-105 transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="text-lg text-primary">{memory.date}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {memory.highlights.map((highlight, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-background/50 rounded-lg border border-primary/20 glow-text-subtle"
                  >
                    {highlight}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MemoryWall;
