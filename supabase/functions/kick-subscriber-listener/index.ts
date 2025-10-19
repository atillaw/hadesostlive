import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Kick Pusher configuration
const PUSHER_URL = "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0-rc2&flash=false";
const CHANNEL_NAME = "hadesost"; // Your Kick channel name
const CHANNEL_ID = "41050427"; // Your Kick channel ID

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const upgradeHeader = req.headers.get("upgrade") || "";
  
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let kickSocket: WebSocket | null = null;
  let chatroomId: string | null = null;

  // Get channel info to find chatroom ID
  const getChannelInfo = async () => {
    try {
      const response = await fetch(`https://kick.com/api/v2/channels/${CHANNEL_NAME}`);
      const data = await response.json();
      chatroomId = data.chatroom?.id?.toString();
      console.log(`[Kick Listener] Chatroom ID: ${chatroomId}`);
      return chatroomId;
    } catch (error) {
      console.error("[Kick Listener] Error fetching channel info:", error);
      return null;
    }
  };

  const connectToKick = async () => {
    if (!chatroomId) {
      await getChannelInfo();
    }

    if (!chatroomId) {
      console.error("[Kick Listener] Could not get chatroom ID");
      socket.send(JSON.stringify({ error: "Could not connect to Kick channel" }));
      return;
    }

    kickSocket = new WebSocket(PUSHER_URL);

    kickSocket.onopen = () => {
      console.log("[Kick Listener] Connected to Kick Pusher");
      
      // Subscribe to channel events for subscription events
      const subscribeMessage = {
        event: "pusher:subscribe",
        data: {
          auth: "",
          channel: `channel.${CHANNEL_ID}`
        }
      };
      
      kickSocket!.send(JSON.stringify(subscribeMessage));
      socket.send(JSON.stringify({ status: "connected", channel: CHANNEL_NAME }));
    };

    kickSocket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[Kick Listener] Event received:", data.event);

        // Handle subscription events
        if (data.event === "App\\Events\\SubscriptionEvent") {
          const eventData = JSON.parse(data.data);
          console.log("[Kick Listener] Subscription event:", eventData);

          const subscriberData = {
            username: eventData.username || eventData.subscriber_username || "Unknown",
            subscription_tier: eventData.months ? `${eventData.months} Month${eventData.months > 1 ? 's' : ''}` : "Tier 1",
            subscription_type: eventData.gifter_username ? "Gifted" : "Monthly",
            subscribed_at: new Date().toISOString(),
          };

          // Insert into database
          const { error } = await supabaseAdmin
            .from("kick_subscribers")
            .insert(subscriberData);

          if (error) {
            console.error("[Kick Listener] Error inserting subscriber:", error);
          } else {
            console.log("[Kick Listener] New subscriber added:", subscriberData.username);
            socket.send(JSON.stringify({ 
              type: "new_subscriber", 
              subscriber: subscriberData 
            }));
          }
        }

        // Handle gift subscription events
        if (data.event === "App\\Events\\GiftedSubscriptionsEvent") {
          const eventData = JSON.parse(data.data);
          console.log("[Kick Listener] Gifted subscriptions event:", eventData);

          const gifterUsername = eventData.gifter_username || "Anonymous";
          const giftedCount = eventData.gifted_usernames?.length || 1;

          // Process each gifted subscription
          if (eventData.gifted_usernames) {
            for (const username of eventData.gifted_usernames) {
              const subscriberData = {
                username: username,
                subscription_tier: "Tier 1",
                subscription_type: `Gifted by ${gifterUsername}`,
                subscribed_at: new Date().toISOString(),
              };

              await supabaseAdmin
                .from("kick_subscribers")
                .insert(subscriberData);
            }
          }

          socket.send(JSON.stringify({ 
            type: "gifted_subs", 
            gifter: gifterUsername,
            count: giftedCount
          }));
        }

        // Forward all events to client for debugging
        socket.send(JSON.stringify({ type: "kick_event", data }));

      } catch (error) {
        console.error("[Kick Listener] Error processing message:", error);
      }
    };

    kickSocket.onerror = (error) => {
      console.error("[Kick Listener] WebSocket error:", error);
      socket.send(JSON.stringify({ error: "Connection error" }));
    };

    kickSocket.onclose = () => {
      console.log("[Kick Listener] Disconnected from Kick");
      socket.send(JSON.stringify({ status: "disconnected" }));
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        console.log("[Kick Listener] Attempting to reconnect...");
        connectToKick();
      }, 5000);
    };
  };

  socket.onopen = () => {
    console.log("[Kick Listener] Client connected");
    connectToKick();
  };

  socket.onclose = () => {
    console.log("[Kick Listener] Client disconnected");
    if (kickSocket) {
      kickSocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error("[Kick Listener] Client socket error:", error);
  };

  return response;
});
