import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSupportMessages, useSendSupportMessage } from "@/hooks/useSupportChat";
import { format } from "date-fns";
import deluxLogo from "@/assets/delux-logo.png";

export default function Support() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: messages, isLoading } = useSupportMessages(user?.id);
  const sendMessage = useSendSupportMessage();
  const [newMessage, setNewMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-display font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">Please sign in to access support chat.</p>
            <Button onClick={() => navigate("/signin")} className="gradient-primary border-0">Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      await sendMessage.mutateAsync({ userId: user.id, message: newMessage.trim() });
      setNewMessage("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch {
      // error handled by mutation
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30 py-6">
        <div className="container max-w-2xl">
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center gap-3">
              <img src={deluxLogo} alt="Delux" className="h-8 w-8 rounded-full" />
              <div>
                <h2 className="font-semibold">Delux Support</h2>
                <p className="text-xs text-muted-foreground">We typically reply within a few hours</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Welcome message */}
              <div className="flex gap-2">
                <img src={deluxLogo} alt="Delux" className="h-8 w-8 rounded-full shrink-0 mt-1" />
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm">Hi! 👋 Welcome to Delux Support. How can we help you today?</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Delux Support</p>
                </div>
              </div>

              {isLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {messages?.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.is_admin_reply ? "" : "flex-row-reverse"}`}>
                  {msg.is_admin_reply && (
                    <img src={deluxLogo} alt="Delux" className="h-8 w-8 rounded-full shrink-0 mt-1" />
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
                    msg.is_admin_reply
                      ? "bg-secondary rounded-tl-sm"
                      : "gradient-primary text-primary-foreground rounded-tr-sm"
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.is_admin_reply ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                      {msg.is_admin_reply ? "Delux Support" : "You"} • {format(new Date(msg.created_at), "h:mm a")}
                    </p>
                  </div>
                </div>
              ))}

              {/* Success message */}
              {showSuccess && (
                <div className="flex justify-center animate-fade-in">
                  <div className="bg-primary/10 text-primary rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    The message you entered has been sent successfully. Please wait a moment while we process and answer your question.
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="gradient-primary border-0 shrink-0" disabled={!newMessage.trim() || sendMessage.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
