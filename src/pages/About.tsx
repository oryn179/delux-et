import { useNavigate } from "react-router-dom";
import { Target, Eye, Percent, Users, MapPin, Shield, Home, Handshake, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const whyDelux = [
  {
    icon: Percent,
    title: "100% Free",
    description: "No fees, no payments. Delux connects people, not wallets.",
  },
  {
    icon: Users,
    title: "Community Powered",
    description: "Built for people, by people. Everyone can participate.",
  },
  {
    icon: MapPin,
    title: "Ethiopia Focused",
    description: "Designed for local housing needs across Ethiopia.",
  },
  {
    icon: Shield,
    title: "Trusted & Verified",
    description: "All listings verified by our community moderators.",
  },
];

const whatWeOffer = [
  { icon: Home, title: "Free home listings" },
  { icon: Handshake, title: "Rent and sell options" },
  { icon: Search, title: "Location-based search" },
  { icon: Users, title: "Direct user connection" },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero py-20 md:py-28">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
              About <span className="text-gradient">Delux</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get your home with free
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 md:py-20">
          <div className="container max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Delux is a brand-new, community-driven platform working in Ethiopia. 
                We help people find homes without any payment.
              </p>

              <div className="bg-accent/50 rounded-2xl p-6 md:p-8 mb-12">
                <p className="text-xl font-medium text-center">
                  No agents. No fees. <span className="text-primary">Just connection.</span>
                </p>
              </div>

              {/* Who We Are */}
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Who We Are</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Delux connects homeowners and home seekers in a simple and transparent way. 
                  Delux is not a marketplace — it is a community connection.
                </p>
              </div>

              {/* Mission & Vision */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                  <p className="text-muted-foreground">
                    To help people find homes easily and freely by connecting homeowners 
                    and seekers across Ethiopia.
                  </p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Eye className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                  <p className="text-muted-foreground">
                    To become Ethiopia's most trusted free housing connection platform.
                  </p>
                </div>
              </div>

              {/* Why Delux */}
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 text-center">
                  Why Delux?
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {whyDelux.map((item, index) => (
                    <div
                      key={item.title}
                      className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What We Offer */}
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 text-center">
                  What We Offer
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {whatWeOffer.map((item) => (
                    <div
                      key={item.title}
                      className="bg-secondary/50 rounded-xl p-4 text-center"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent mx-auto flex items-center justify-center mb-3">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="font-medium text-sm">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Our Promise */}
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border mb-12">
                <h2 className="text-2xl font-display font-bold mb-4 text-center">Our Promise</h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                  Delux is committed to staying free, simple, and accessible for all Ethiopians.
                </p>
              </div>

              {/* Closing Statement */}
              <div className="text-center py-8 border-t border-border">
                <p className="text-xl font-medium mb-2">
                  Delux is not a marketplace.
                </p>
                <p className="text-2xl font-display font-bold text-gradient">
                  It's a connection.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button
                  onClick={() => navigate("/")}
                  className="gradient-primary border-0 gap-2"
                  size="lg"
                >
                  Explore Homes
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  variant="outline"
                  size="lg"
                >
                  Join Delux Today
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
