import { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, Timer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TelegramVerificationProps {
  onVerified?: () => void;
  isAlreadyVerified?: boolean;
}

export function TelegramVerification({ onVerified, isAlreadyVerified }: TelegramVerificationProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"input" | "otp">("input");
  const [telegramId, setTelegramId] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(isAlreadyVerified || false);

  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async () => {
    if (!telegramId) {
      toast({ title: "Error", description: "Please enter your Telegram ID/Username", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-telegram-otp", {
        body: { telegram_id: telegramId, action: "send" }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setStep("otp");
      setTimer(60);
      toast({ title: "OTP Sent", description: "Please check your Telegram for the verification code." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({ title: "Error", description: "Please enter the 6-digit OTP", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-telegram-otp", {
        body: { action: "verify", code: otp }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setIsVerified(true);
      toast({ title: "Verified", description: "Your account has been successfully verified." });
      if (onVerified) onVerified();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20 text-primary">
        <CheckCircle2 className="h-5 w-5" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Verified Account</p>
          <p className="text-xs opacity-80">Your identity is confirmed via Telegram.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold">Telegram Verification</h3>
          <p className="text-xs text-muted-foreground">Confirm your identity to post listings</p>
        </div>
      </div>

      {step === "input" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegram-id">Telegram Chat ID / Username</Label>
            <div className="relative">
              <Input
                id="telegram-id"
                placeholder="@username or chat id"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Start our bot @DeluxVerifyBot (placeholder) to receive your code.
            </p>
          </div>
          <Button 
            onClick={handleSendOTP} 
            className="w-full gradient-primary border-0 gap-2"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Verification Code"}
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="otp">Enter 6-digit Code</Label>
              {timer > 0 && (
                <div className="flex items-center gap-1 text-xs text-primary font-medium">
                  <Timer className="h-3 w-3" />
                  {timer}s
                </div>
              )}
            </div>
            <Input
              id="otp"
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-mono"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setStep("input")}
              disabled={loading}
            >
              Back
            </Button>
            <Button 
              onClick={handleVerifyOTP} 
              className="flex-[2] gradient-primary border-0"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Now"}
            </Button>
          </div>

          {timer === 0 && (
            <button 
              onClick={handleSendOTP}
              className="w-full text-xs text-primary hover:underline"
              disabled={loading}
            >
              Didn't receive a code? Resend
            </button>
          )}
        </div>
      )}

      <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-secondary/50 p-2 rounded-lg">
        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
        <p>
          Security note: 7 failed attempts will suspend verification for 1 hour 30 minutes. 
          Codes are valid for 60 seconds.
        </p>
      </div>
    </div>
  );
}
