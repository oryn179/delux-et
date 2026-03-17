import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, CheckCircle, Loader2, Bot, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSupportMessages, useSendSupportMessage } from "@/hooks/useSupportChat";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import deluxLogo from "@/assets/delux-logo.png";

export default function Support() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: humanMessages, isLoading } = useSupportMessages(user?.id);
  const sendHumanMessage = useSendSupportMessage();
  const [newMessage, setNewMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [mode, setMode] = useState<"ai" | "human">("ai");
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [humanMessages, aiMessages]);

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

  const handleAiSend = async () => {
    if (!newMessage.trim()) return;
    const userMsg = { role: "user" as const, content: newMessage.trim() };
    const updatedMessages = [...aiMessages, userMsg];
    setAiMessages(updatedMessages);
    setNewMessage("");
    setAiLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!resp.ok) {
        setAiMessages([...updatedMessages, { role: "assistant", content: "Sorry, I'm having trouble right now. Please try our human support instead." }]);
        setAiLoading(false);
        return;
      }

      const data = await resp.json();
      setAiMessages([...updatedMessages, { role: "assistant", content: data.reply }]);

      // If escalation needed, auto-forward to human support
      if (data.escalate && user) {
        await sendHumanMessage.mutateAsync({
          userId: user.id,
          message: `[Escalated from AI] ${userMsg.content}`,
        });
      }
    } catch {
      setAiMessages([...updatedMessages, { role: "assistant", content: "Something went wrong. Please try human support." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleHumanSend = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      await sendHumanMessage.mutateAsync({ userId: user.id, message: newMessage.trim() });
      setNewMessage("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch {
      // error handled by mutation
    }
  };

  const handleSend = mode === "ai" ? handleAiSend : handleHumanSend;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30 py-6">
        <div className="container max-w-2xl">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === "ai" ? "default" : "outline"}
              className={mode === "ai" ? "gradient-primary border-0 gap-2" : "gap-2"}
              onClick={() => setMode("ai")}
            >
              <Bot className="h-4 w-4" /> AI Support
            </Button>
            <Button
              variant={mode === "human" ? "default" : "outline"}
              className={mode === "human" ? "gradient-primary border-0 gap-2" : "gap-2"}
              onClick={() => setMode("human")}
            >
              <MessageCircle className="h-4 w-4" /> Human Support
            </Button>
          </div>

          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden flex flex-col" style={{ height: "calc(100vh - 260px)" }}>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center gap-3">
              {mode === "ai" ? (
                <>
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Delux AI Support</h2>
                    <p className="text-xs text-muted-foreground">Instant answers • Complex questions forwarded to team</p>
                  </div>
                </>
              ) : (
                <>
                  <img src={deluxLogo} alt="Delux" className="h-8 w-8 rounded-full" />
                  <div>
                    <h2 className="font-semibold">Delux Support Team</h2>
                    <p className="text-xs text-muted-foreground">We typically reply within a few hours</p>
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mode === "ai" ? (
                <>
                  {/* AI Welcome */}
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                      <p className="text-sm">Hi! 👋 I'm Delux AI Support. Ask me anything about using Delux — listings, search, accounts, and more. For complex questions, I'll connect you with our team!</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Delux AI</p>
                    </div>
                  </div>

                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}>
                      {msg.role === "assistant" && (
                        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
                        msg.role === "assistant"
                          ? "bg-secondary rounded-tl-sm"
                          : "gradient-primary text-primary-foreground rounded-tr-sm"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                          {msg.role === "assistant" ? "Delux AI" : "You"}
                        </p>
                      </div>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Human Welcome */}
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

                  {humanMessages?.map((msg) => (
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

                  {showSuccess && (
                    <div className="flex justify-center animate-fade-in">
                      <div className="bg-primary/10 text-primary rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        The message you entered has been sent successfully. Please wait a moment while we process and answer your question.
                      </div>
                    </div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Switch mode hint */}
            {mode === "ai" && (
              <div className="px-4 pb-2">
                <button
                  onClick={() => setMode("human")}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                >
                  Need human help? Switch to Human Support <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={mode === "ai" ? "Ask Delux AI anything..." : "Type your message..."}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="gradient-primary border-0 shrink-0"
                  disabled={!newMessage.trim() || aiLoading || sendHumanMessage.isPending}
                >
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
