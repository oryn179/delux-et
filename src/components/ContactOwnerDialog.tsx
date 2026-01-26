import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

interface ContactOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
}

export function ContactOwnerDialog({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
  ownerId,
  ownerName,
}: ContactOwnerDialogProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Pre-fill form with user data
  const name = formData.name || profile?.name || user?.user_metadata?.name || "";
  const email = formData.email || user?.email || "";
  const phone = formData.phone || profile?.phone || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      // Insert message into database
      const { error: messageError } = await supabase.from("messages").insert({
        property_id: propertyId,
        sender_id: user.id,
        recipient_id: ownerId,
        sender_name: name,
        sender_email: email,
        sender_phone: phone,
        message: formData.message,
      });

      if (messageError) throw messageError;

      // Call edge function to send email notification
      const { error: emailError } = await supabase.functions.invoke("send-property-inquiry", {
        body: {
          propertyId,
          propertyTitle,
          ownerName,
          senderName: name,
          senderEmail: email,
          senderPhone: phone,
          message: formData.message,
        },
      });

      if (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't throw - message was still saved
      }

      toast({
        title: "Message Sent!",
        description: "The property owner will be notified of your inquiry.",
      });

      setFormData({ name: "", email: "", phone: "", message: "" });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {ownerName}</DialogTitle>
          <DialogDescription>
            Send a message about: {propertyTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="I'm interested in this property..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full gradient-primary border-0" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
