import { Target, Eye, Percent, Users, MapPin, Shield } from "lucide-react";

const features = [
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
    description: "Designed for local housing needs in Addis Ababa.",
  },
  {
    icon: Shield,
    title: "Trusted & Verified",
    description: "All listings verified by our community moderators.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                About <span className="text-gradient">Delux</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Get your home with free
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Delux is a brand-new community-driven platform working in Ethiopia. 
              We connect people with homes at no cost. No payments. No agents. Just connection.
              Our mission is to make housing accessible to everyone in Ethiopia.
            </p>

            {/* Mission & Vision */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  To build Ethiopia's most trusted free housing connection platform.
                </p>
              </div>
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Our Vision</h3>
                <p className="text-sm text-muted-foreground">
                  Empowering every Ethiopian to find their perfect home freely.
                </p>
              </div>
            </div>
          </div>

          {/* Right Features */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-6">Why Delux?</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
