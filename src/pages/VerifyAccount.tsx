import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type VerificationMethod = "email" | "phone" | null;

export default function VerifyAccount() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: profile } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();

  const [method, setMethod] = useState<VerificationMethod>(null);
  const [step, setStep] = useState<"select" | "input" | "verify" | "email-sent" | "success">("select");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Simple math CAPTCHA for phone verification
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const captcha = useMemo(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, answer: a + b };
  }, [step]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8">
            <h1 className="text-2xl font-display font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">Please sign in to verify your account.</p>
            <Button onClick={() => navigate("/signin")} className="gradient-primary border-0">Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOAuthUser = user.app_metadata?.provider === "google" || user.app_metadata?.provider === "apple";
  const isVerified = profile?.verified || isOAuthUser;

  if (isVerified) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Already Verified!</h1>
            <p className="text-muted-foreground mb-6">Your account is already verified.</p>
            <Button onClick={() => navigate("/list-property")} className="gradient-primary border-0">
              Create Listing
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSelectMethod = (selectedMethod: VerificationMethod) => {
    setMethod(selectedMethod);
    if (selectedMethod === "email") {
      handleSendEmailLink();
    } else {
      setStep("input");
    }
  };

  // EMAIL: Send verification LINK (not OTP)
  const handleSendEmailLink = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: { action: 'send', email: user.email }
      });

      if (error) throw error;

      if (data?.success) {
        setStep("email-sent");
        toast({
          title: "Verification link sent! 📧",
          description: `Check your inbox at ${user.email} and click the link.`,
        });
      } else {
        throw new Error(data?.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to send verification email.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // PHONE: Validate CAPTCHA, then send SMS code
  const handleSendPhoneVerification = async () => {
    if (parseInt(captchaAnswer) !== captcha.answer) {
      toast({ title: "Wrong answer", description: "Please solve the math problem correctly.", variant: "destructive" });
      return;
    }

    if (!phoneNumber || phoneNumber.length < 9) {
      toast({ title: "Invalid phone", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('twilio-verify', {
        body: { action: 'send', phone: phoneNumber }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Code sent! 📱",
          description: `A code has been sent to +251 ${phoneNumber}`,
        });
        setStep("verify");
      } else {
        throw new Error(data?.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to send SMS.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (verificationCode.length !== 6) {
      toast({ title: "Invalid code", description: "Please enter a 6-digit code.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('twilio-verify', {
        body: { action: 'verify', phone: phoneNumber, code: verificationCode }
      });

      if (error) throw error;

      if (!data?.success) {
        toast({ title: "Invalid code", description: "The verification code is incorrect.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      await updateProfile.mutateAsync({
        userId: user.id,
        updates: {
          verified: true,
          verification_method: "phone",
          phone_verified: true,
          phone: phoneNumber,
        },
      });

      setStep("success");
      toast({ title: "Verified! ✅", description: "Your account has been verified." });
    } catch (error) {
      console.error('Verification error:', error);
      toast({ title: "Error", description: "Failed to verify account.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 bg-secondary/30">
        <div className="container max-w-md">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border">
            {/* SELECT METHOD */}
            {step === "select" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-display font-bold mb-2">Verify Your Account</h1>
                  <p className="text-muted-foreground">
                    Verification is required to post property listings.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleSelectMethod("email")}
                    disabled={isLoading}
                    className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-muted-foreground">
                        We'll send a link to {user.email}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectMethod("phone")}
                    className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Phone Verification (SMS)</p>
                      <p className="text-sm text-muted-foreground">
                        We'll send an SMS to your phone
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* EMAIL SENT - waiting for user to click link */}
            {step === "email-sent" && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-accent mx-auto flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold mb-2">Check Your Email 📧</h1>
                  <p className="text-muted-foreground">
                    We sent a verification link to <strong>{user.email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the link in the email to verify your account. The link expires in 30 minutes.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleSendEmailLink}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Resend Link
                </Button>

                <Button variant="ghost" onClick={() => setStep("select")} className="w-full">
                  Choose different method
                </Button>
              </div>
            )}

            {/* PHONE INPUT + CAPTCHA */}
            {step === "input" && method === "phone" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-display font-bold mb-2">Enter Phone Number</h1>
                  <p className="text-muted-foreground">
                    We'll send a verification code via SMS
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex gap-2">
                      <div className="w-20 h-11 px-3 rounded-lg bg-secondary border-0 flex items-center justify-center text-sm">
                        +251
                      </div>
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="91 234 5678"
                        className="flex-1"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Human verification - math CAPTCHA */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Prove you're human
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-lg bg-secondary font-mono font-bold text-lg">
                        {captcha.a} + {captcha.b} = ?
                      </div>
                      <Input
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value.replace(/\D/g, ""))}
                        placeholder="Answer"
                        className="w-24"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSendPhoneVerification}
                    disabled={isLoading || phoneNumber.length < 9 || !captchaAnswer}
                    className="w-full gradient-primary border-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Code"
                    )}
                  </Button>

                  <Button variant="ghost" onClick={() => { setStep("select"); setCaptchaAnswer(""); }} className="w-full">
                    Choose different method
                  </Button>
                </div>
              </div>
            )}

            {/* PHONE OTP VERIFY */}
            {step === "verify" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-display font-bold mb-2">Enter Verification Code</h1>
                  <p className="text-muted-foreground">
                    We sent a 6-digit code to +251 {phoneNumber}
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={(value) => setVerificationCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleVerifyPhoneCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full gradient-primary border-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => { setStep("input"); setVerificationCode(""); }}
                  className="w-full"
                >
                  Resend Code
                </Button>
              </div>
            )}

            {/* SUCCESS */}
            {step === "success" && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold mb-2">Verification Complete! ✅</h1>
                  <p className="text-muted-foreground">
                    Your account is now verified. You can start posting property listings.
                  </p>
                </div>
                <Button onClick={() => navigate("/list-property")} className="gradient-primary border-0">
                  Create Your First Listing
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
