import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, User, Home, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserMessages, useSendReply, useMarkAsRead } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Inbox() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: messages, isLoading } = useUserMessages(user?.id);
  const sendReply = useSendReply();
  const markAsRead = useMarkAsRead();
  
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">Please sign in to view your messages.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
              <Button onClick={() => navigate("/signin")} className="gradient-primary border-0">Sign In</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleOpenMessage = async (message: any) => {
    setSelectedMessage(message);
    setReplyText("");
    
    // Mark as read if it's received and unread
    if (message.recipient_id === user.id && !message.read_at) {
      try {
        await markAsRead.mutateAsync(message.id);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    setIsSending(true);
    try {
      await sendReply.mutateAsync({
        propertyId: selectedMessage.property_id,
        recipientId: selectedMessage.sender_id,
        message: replyText,
        senderName: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        senderEmail: user.email || "",
        senderPhone: user.user_metadata?.phone || null,
      });
      
      toast({ title: "Reply sent!", description: "Your message has been sent successfully." });
      setReplyText("");
      setSelectedMessage(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to send reply.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const receivedMessages = messages?.filter(m => m.recipient_id === user.id) || [];
  const sentMessages = messages?.filter(m => m.sender_id === user.id) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 bg-secondary/30">
        <div className="container max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">
              <span className="text-gradient">Messages</span>
            </h1>
            <p className="text-muted-foreground">View and respond to property inquiries</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Received Messages */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Received Inquiries ({receivedMessages.length})
                </h2>
                
                {receivedMessages.length > 0 ? (
                  <div className="space-y-3">
                    {receivedMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleOpenMessage(message)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                          message.read_at ? "bg-secondary/50 border-border" : "bg-accent border-primary/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{message.sender_name}</span>
                              {!message.read_at && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate mb-1">
                              {message.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Home className="h-3 w-3" />
                                Property Inquiry
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(message.created_at), "MMM d, h:mm a")}
                              </span>
                            </div>
                          </div>
                          <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">When someone inquires about your property, you'll see it here.</p>
                  </div>
                )}
              </div>

              {/* Sent Messages */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Sent Messages ({sentMessages.length})
                </h2>
                
                {sentMessages.length > 0 ? (
                  <div className="space-y-3">
                    {sentMessages.map((message) => (
                      <div
                        key={message.id}
                        className="p-4 rounded-lg border border-border bg-secondary/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm mb-1">{message.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(message.created_at), "MMM d, h:mm a")}
                              </span>
                              {message.read_at && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Read
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No sent messages</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selectedMessage?.sender_name}</DialogTitle>
            <DialogDescription>
              {selectedMessage && format(new Date(selectedMessage.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm">{selectedMessage.message}</p>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Email:</strong> {selectedMessage.sender_email}</p>
                {selectedMessage.sender_phone && (
                  <p><strong>Phone:</strong> {selectedMessage.sender_phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reply</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  Close
                </Button>
                <Button 
                  onClick={handleSendReply} 
                  disabled={!replyText.trim() || isSending}
                  className="gradient-primary border-0"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reply"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
