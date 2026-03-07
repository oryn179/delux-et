import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

export default function VerifyAccount() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: profile } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"quiz" | "success">("quiz");

  // Security questions
  const captcha = useMemo(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, answer: a + b };
  }, []);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

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
            <Button onClick={() => navigate("/list-property")} className="gradient-primary border-0">Create Listing</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleVerify = async () => {
    if (parseInt(captchaAnswer) !== captcha.answer) {
      toast({ title: "Wrong answer", description: "Please solve the math problem correctly.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: { verified: true, verification_method: "security_question" },
      });
      setStep("success");
      toast({ title: "Verified! ✅", description: "Your account has been verified." });
    } catch (error) {
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
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border">
            {step === "quiz" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-display font-bold mb-2">Verify Your Account</h1>
                  <p className="text-muted-foreground">Solve the simple question below to verify you're human.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      What is the answer?
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-3 rounded-xl bg-secondary font-mono font-bold text-xl">
                        {captcha.a} + {captcha.b} = ?
                      </div>
                      <Input
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value.replace(/\D/g, ""))}
                        placeholder="Answer"
                        className="w-24 text-lg"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleVerify}
                    disabled={isLoading || !captchaAnswer}
                    className="w-full gradient-primary border-0"
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</>
                    ) : (
                      "Verify Account"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-display font-bold">Account Verified!</h1>
                <p className="text-muted-foreground">You can now post property listings.</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate("/")} className="flex-1">Go Home</Button>
                  <Button onClick={() => navigate("/list-property")} className="flex-1 gradient-primary border-0">Create Listing</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
