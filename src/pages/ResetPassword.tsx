import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import deluxLogo from "@/assets/delux-logo.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Check URL hash for recovery type
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: "Password updated!", description: "You can now sign in with your new password." });
      setTimeout(() => navigate("/signin"), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Link to="/">
            <img src={deluxLogo} alt="Delux" className="h-12 mx-auto mb-4" />
          </Link>
          <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border">
            <h1 className="text-xl font-bold mb-2">Invalid Reset Link</h1>
            <p className="text-muted-foreground mb-4">This link has expired or is invalid. Please request a new one.</p>
            <Button onClick={() => navigate("/forgot-password")} className="gradient-primary border-0">
              Request New Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={deluxLogo} alt="Delux" className="h-12 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-display font-bold">Set New Password</h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated border border-border">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold">Password Updated!</h2>
              <p className="text-muted-foreground text-sm">Redirecting to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary border-0" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
