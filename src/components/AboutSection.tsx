import { useNavigate } from "react-router-dom";
import { Target, Eye, Percent, Users, MapPin, Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Percent,
    title: "100% Free",
    description: "No fees or hidden costs. Delux connects people, not wallets.",
  },
  {
    icon: Users,
    title: "Direct Connection",
    description: "Talk directly to homeowners. No middlemen.",
  },
  {
    icon: MapPin,
    title: "Community First",
    description: "Built for Ethiopian users by the community.",
  },
  {
    icon: Shield,
    title: "Trusted & Verified",
    description: "All listings verified by our community moderators.",
  },
];

export function AboutSection() {
  const navigate = useNavigate();

  return (
    <section id="about" className="py-20">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Why Choose <span className="text-gradient">Delux</span>?
              </h2>
              <p className="text-lg text-muted-foreground">
                Your trusted housing connection in Ethiopia
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={() => navigate("/about")}>
              Learn More About Delux
            </Button>
          </div>

          {/* Right - CTA Card */}
          <div className="bg-card rounded-3xl p-8 md:p-10 shadow-elevated border border-border">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6">
              <Home className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Own a Home?
            </h3>
            <p className="text-muted-foreground mb-6">
              List your home for rent or sale — free and easy. 
              Connect with home seekers across Ethiopia without any fees.
            </p>
            <Button 
              size="lg" 
              className="gradient-primary border-0 w-full sm:w-auto"
              onClick={() => navigate("/list-property")}
            >
              Homeowner? List Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
