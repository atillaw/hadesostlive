import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ReactiveBackground = () => {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    // Listen to chat activity
    const channel = supabase
      .channel('chat-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meme_chat_messages'
        },
        () => {
          setIsPulsing(true);
          setTimeout(() => setIsPulsing(false), 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div
        className={`absolute inset-0 transition-all duration-2000 ${
          isPulsing ? 'opacity-30 scale-105' : 'opacity-0 scale-100'
        }`}
        style={{
          background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};

export default ReactiveBackground;
