import { Search, MapPin, Home, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-home.jpg";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
                Get Your Home{" "}
                <span className="text-gradient">with Free</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Delux is the brand new connection working in Ethiopia offering fully furnished homes
                for free in Addis Ababa. No agents, no payments — just connection.
              </p>
            </div>

            {/* Search Box */}
            <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select className="w-full h-11 pl-10 pr-8 rounded-lg bg-secondary border-0 text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20">
                    <option>Property Type</option>
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Villa</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select className="w-full h-11 pl-10 pr-8 rounded-lg bg-secondary border-0 text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20">
                    <option>Location</option>
                    <option>Bole</option>
                    <option>Kazanchis</option>
                    <option>Piassa</option>
                    <option>Arada</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <Button className="h-11 gradient-primary border-0 gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="sm" className="rounded-full">
                Browse Free Listings
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                List Your Property
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">Free Service</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Listed Homes</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-primary">1K+</p>
                <p className="text-sm text-muted-foreground">Happy Families</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img
                src={heroImage}
                alt="Beautiful furnished home interior"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-elevated border border-border animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                  <Home className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Finding the Most Popular Homes</p>
                  <p className="text-sm text-muted-foreground">Addis Ababa, Piassa Arada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
