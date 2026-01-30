import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Coffee, Heart, ExternalLink } from "lucide-react";

export default function Support() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 gradient-hero py-16">
        <div className="container max-w-2xl">
          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-card border border-border text-center">
            <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center">
              <Coffee className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Support <span className="text-gradient">Delux</span>
            </h1>
            
            <p className="text-muted-foreground mb-8 text-lg">
              Delux is a free platform connecting homeowners and renters in Ethiopia. 
              Your support helps us keep the platform running and growing!
            </p>
            
            <div className="bg-accent/50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-destructive" />
                <span className="font-semibold">Buy us a coffee!</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Every contribution helps us maintain and improve Delux for our community.
              </p>
            </div>
            
            <Button
              size="lg"
              className="gradient-primary border-0 gap-2 text-lg px-8"
              onClick={() => window.open("https://buymeacoffee.com/delux", "_blank")}
            >
              <Coffee className="h-5 w-5" />
              Buy Me a Coffee
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <p className="text-sm text-muted-foreground mt-8">
              Thank you for being part of the Delux community! 🇪🇹
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
