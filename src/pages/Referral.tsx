import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Share2, Users, Gift, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useReferralCode, useReferralStats } from "@/hooks/useReferral";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Referral() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: referralCode, isLoading } = useReferralCode(user?.id);
  const { data: stats } = useReferralStats(user?.id);
  const [copied, setCopied] = useState(false);
  const [prizeAmount, setPrizeAmount] = useState(20);

  // Load dynamic prize from system settings
  useEffect(() => {
    supabase
      .from("system_settings")
      .select("value")
      .eq("key", "referral_prize")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          const val = parseInt(String(data.value).replace(/"/g, ""), 10);
          if (!isNaN(val)) setPrizeAmount(val);
        }
      });
  }, []);

  const referralLink = referralCode
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : "";

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Delux - Free Home Agent",
          text: `Use my referral code ${referralCode} to join Delux and find your home for free!`,
          url: referralLink,
        });
      } catch {}
    } else {
      handleCopy(referralLink);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8">
            <Gift className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-display font-bold mb-2">Invite & Earn</h1>
            <p className="text-muted-foreground mb-6">Sign in to get your referral code and start earning.</p>
            <Button onClick={() => navigate("/signin")} className="gradient-primary border-0">Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 bg-secondary/30">
        <div className="container max-w-lg">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
              <Gift className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Invite & Earn</h1>
            <p className="text-muted-foreground">
              Share your code and earn <strong className="text-primary">{prizeAmount} ETB</strong> for every friend who joins!
            </p>
          </div>

          {/* Referral Code Card */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your referral code</p>
            {isLoading ? (
              <div className="h-12 bg-secondary animate-pulse rounded-xl" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-secondary rounded-xl px-4 py-3 font-mono text-2xl font-bold tracking-[0.3em] text-center">
                  {referralCode}
                </div>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => handleCopy(referralCode || "")}>
                  {copied ? <Check className="h-5 w-5 text-primary" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            )}
          </div>

          {/* Share Link */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
            <p className="text-sm text-muted-foreground mb-2">Share your link</p>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-xs" />
              <Button onClick={() => handleCopy(referralLink)} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleShare} className="w-full mt-4 gradient-primary border-0 gap-2">
              <Share2 className="h-4 w-4" /> Share with Friends
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats?.count || 0}</p>
              <p className="text-xs text-muted-foreground">Friends Invited</p>
            </div>
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border text-center">
              <Gift className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{(stats?.credited || 0) * prizeAmount} ETB</p>
              <p className="text-xs text-muted-foreground">Earnings</p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
            <h3 className="font-semibold mb-4">How it works</h3>
            <div className="space-y-4">
              {[
                { step: "1", text: "Share your unique referral code with friends" },
                { step: "2", text: "They sign up using your code" },
                { step: "3", text: `You earn ${prizeAmount} ETB for each signup!` },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <p className="text-sm text-muted-foreground pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
