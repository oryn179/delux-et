import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setErrorMsg("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("send-verification-email", {
          body: { action: "verify", email, token, userId: user?.id },
        });

        if (error) throw error;

        if (data?.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(data?.error || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Verification failed.");
      }
    };

    verify();
  }, [searchParams, user?.id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-secondary/30">
        <div className="bg-card rounded-2xl p-8 shadow-card border border-border max-w-md w-full text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <h1 className="text-xl font-bold">Verifying your account...</h1>
            </>
          )}
          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Account Verified! ✅</h1>
              <p className="text-muted-foreground">Your email has been verified. You can now post listings.</p>
              <Button onClick={() => navigate("/list-property")} className="gradient-primary border-0">
                Create Listing
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold">Verification Failed</h1>
              <p className="text-muted-foreground">{errorMsg}</p>
              <Button onClick={() => navigate("/verify")} variant="outline">
                Try Again
              </Button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
