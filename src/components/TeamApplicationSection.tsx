import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TeamApplicationSection = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    city: "",
    talent: "",
    reason: "",
    recipientEmail: "team@hadesost.com", // Default, can be changed
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.age || !formData.city || !formData.talent || !formData.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-team-application", {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Application Sent!",
        description: "Your team application has been submitted successfully.",
      });

      // Reset form
      setFormData({
        fullName: "",
        age: "",
        city: "",
        talent: "",
        reason: "",
        recipientEmail: formData.recipientEmail,
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-4xl font-bold mb-4 text-center glow-text">Join Our Team</h2>
        <p className="text-muted-foreground text-center mb-8">
          Think you have what it takes? Apply to become part of the HadesOST team!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card/50 backdrop-blur p-8 rounded-lg border border-border card-glow">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Your full name"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Your age"
              required
              min="1"
              max="120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Your city"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="talent">Talent / Skill *</Label>
            <Input
              id="talent"
              value={formData.talent}
              onChange={(e) => setFormData({ ...formData, talent: e.target.value })}
              placeholder="e.g., Game strategy, Video editing, Community management"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Why do you want to join our team? *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Tell us why you'd be a great fit for the team..."
              required
              maxLength={1000}
              rows={6}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default TeamApplicationSection;
