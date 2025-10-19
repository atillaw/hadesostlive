import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminKickSubscribers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriberData, setSubscriberData] = useState("");
  const { toast } = useToast();

  const handleSync = async () => {
    if (!subscriberData.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter subscriber data",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const subscribers = JSON.parse(subscriberData);

      const { error } = await supabase.functions.invoke("sync-kick-subscribers", {
        body: { subscribers },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Kick subscribers synced successfully",
      });
      setSubscriberData("");
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync subscribers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleData = `[
  {
    "username": "example_user",
    "subscription_tier": "Tier 1",
    "subscription_type": "Monthly",
    "subscribed_at": "2025-01-19T10:30:00Z"
  }
]`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Sync Kick Subscribers
        </CardTitle>
        <CardDescription>
          Manually sync subscriber data from Kick. This will add new subscribers to the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Kick doesn't provide a public API for subscriber events yet. 
            You'll need to manually capture subscriber data from Kick's dashboard or use a third-party tool.
            Enter subscriber data in JSON format below.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="subscriber-data">Subscriber Data (JSON)</Label>
          <Textarea
            id="subscriber-data"
            placeholder={exampleData}
            value={subscriberData}
            onChange={(e) => setSubscriberData(e.target.value)}
            className="font-mono text-sm min-h-[200px]"
          />
          <p className="text-xs text-muted-foreground">
            Format: Array of objects with username, subscription_tier, subscription_type, and subscribed_at fields
          </p>
        </div>

        <Button 
          onClick={handleSync} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Syncing..." : "Sync Subscribers"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminKickSubscribers;
