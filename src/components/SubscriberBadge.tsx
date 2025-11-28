import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface SubscriberBadgeProps {
  username: string;
  size?: "sm" | "md";
}

export const SubscriberBadge = ({ username, size = "sm" }: SubscriberBadgeProps) => {
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [tier, setTier] = useState<string>("");

  useEffect(() => {
    checkSubscriber();
  }, [username]);

  const checkSubscriber = async () => {
    // First get kick_username from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("kick_username")
      .eq("username", username)
      .maybeSingle();

    if (!profile?.kick_username) return;

    // Check if they're a subscriber
    const { data: subscriber } = await supabase
      .from("kick_subscribers")
      .select("subscription_tier")
      .eq("username", profile.kick_username)
      .order("subscribed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriber) {
      setIsSubscriber(true);
      setTier(subscriber.subscription_tier);
    }
  };

  if (!isSubscriber) return null;

  return (
    <Badge 
      className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white ${
        size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1"
      }`}
    >
      ⭐ {tier}
    </Badge>
  );
};
