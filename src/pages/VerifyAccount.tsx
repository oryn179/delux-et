import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, CheckCircle, Loader2 } from "lucide-react";
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
  const [step, setStep] = useState<"select" | "input" | "verify" | "success">("select");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  

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

  // Check if user signed up with Google/Apple (already verified)
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
            <p className="text-muted-foreground mb-6">Your account is already verified. You can post listings.</p>
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
      setStep("verify");
      handleSendEmailVerification();
    } else {
      setStep("input");
    }
  };

  const handleSendEmailVerification = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: { action: 'send', email: user.email }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Verification code sent!",
          description: `A 6-digit code has been sent to ${user.email}`,
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

  const handleSendPhoneVerification = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast({ title: "Invalid phone", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // Call Twilio edge function to send verification
      const { data, error } = await supabase.functions.invoke('twilio-verify', {
        body: { action: 'send', phone: phoneNumber }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Verification code sent!",
          description: `A code has been sent to +251 ${phoneNumber}`,
        });
        setStep("verify");
      } else {
        throw new Error(data?.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to send verification SMS.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({ title: "Invalid code", description: "Please enter a 6-digit code.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (method === "phone") {
        // Verify with Twilio
        const { data, error } = await supabase.functions.invoke('twilio-verify', {
          body: { action: 'verify', phone: phoneNumber, code: verificationCode }
        });

        if (error) throw error;

        if (!data?.success) {
          toast({ title: "Invalid code", description: "The verification code is incorrect.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
      } else {
        // Email verification via edge function
        const { data, error } = await supabase.functions.invoke('send-verification-email', {
          body: { action: 'verify', email: user.email, code: verificationCode }
        });

        if (error) throw error;

        if (!data?.success) {
          toast({ title: "Invalid code", description: data?.error || "The verification code is incorrect.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
      }

      // Update profile as verified
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: {
          verified: true,
          verification_method: method,
          email_verified: method === "email",
          phone_verified: method === "phone",
          phone: method === "phone" ? phoneNumber : profile?.phone,
        },
      });

      setStep("success");
      toast({ title: "Verified!", description: "Your account has been verified successfully." });
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
            {step === "select" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-display font-bold mb-2">Verify Your Account</h1>
                  <p className="text-muted-foreground">
                    Verification is required to post property listings. Choose how you'd like to verify:
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleSelectMethod("email")}
                    className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-muted-foreground">
                        We'll send a code to {user.email}
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
                      <p className="font-medium">Phone Verification (Twilio)</p>
                      <p className="text-sm text-muted-foreground">
                        We'll send an SMS to your phone
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

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

                  <Button
                    onClick={handleSendPhoneVerification}
                    disabled={isLoading || phoneNumber.length < 9}
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

                  <Button variant="ghost" onClick={() => setStep("select")} className="w-full">
                    Choose different method
                  </Button>
                </div>
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-display font-bold mb-2">Enter Verification Code</h1>
                  <p className="text-muted-foreground">
                    We sent a 6-digit code to{" "}
                    {method === "email" ? user.email : `+251 ${phoneNumber}`}
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
                  onClick={handleVerifyCode}
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
                  onClick={method === "email" ? handleSendEmailVerification : handleSendPhoneVerification}
                  className="w-full"
                >
                  Resend Code
                </Button>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold mb-2">Verification Complete!</h1>
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
