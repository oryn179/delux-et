import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Home, Users, Eye, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

function useLiveStats() {
  return useQuery({
    queryKey: ["live-stats"],
    queryFn: async () => {
      const [propertiesRes, profilesRes, viewsRes, areasRes] = await Promise.all([
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("is_available", true)
          .or("listing_status.eq.approved,listing_status.is.null"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("property_views").select("id", { count: "exact", head: true }),
        supabase
          .from("properties")
          .select("area")
          .eq("is_available", true)
          .or("listing_status.eq.approved,listing_status.is.null"),
      ]);

      const uniqueAreas = new Set((areasRes.data || []).map((p) => p.area)).size;

      return {
        listings: propertiesRes.count ?? 0,
        users: profilesRes.count ?? 0,
        views: viewsRes.count ?? 0,
        areas: uniqueAreas,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

export function LiveStats() {
  const { data, isLoading } = useLiveStats();

  const stats = [
    { icon: Home, label: "Active Listings", value: data?.listings ?? 0, color: "text-primary" },
    { icon: Users, label: "Members", value: data?.users ?? 0, color: "text-blue-500" },
    { icon: Eye, label: "Property Views", value: data?.views ?? 0, color: "text-purple-500" },
    { icon: MapPin, label: "Areas Covered", value: data?.areas ?? 0, color: "text-orange-500" },
  ];

  return (
    <section className="py-16 bg-secondary/30 border-y border-border" aria-label="Platform statistics">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Trusted by the <span className="text-gradient">Community</span>
          </h2>
          <p className="text-muted-foreground">Live stats from Delux ET — updated in real time</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl p-6 border border-border shadow-card text-center hover:shadow-elegant transition-shadow"
            >
              <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold mb-1">
                {isLoading ? "—" : <AnimatedNumber value={stat.value} />}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
