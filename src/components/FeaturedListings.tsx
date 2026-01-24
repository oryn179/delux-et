import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";

const properties = [
  {
    id: 1,
    image: property1,
    title: "Modern Family Home",
    location: "Addis Ababa, Piassa Arada",
    bedrooms: 3,
    bathrooms: 2,
    type: "rent" as const,
    isFree: true,
  },
  {
    id: 2,
    image: property2,
    title: "Cozy Furnished Apartment",
    location: "Addis Ababa, Bole",
    bedrooms: 2,
    bathrooms: 1,
    type: "rent" as const,
    isFree: true,
  },
  {
    id: 3,
    image: property3,
    title: "Luxury Villa with Pool",
    location: "Addis Ababa, CMC",
    bedrooms: 5,
    bathrooms: 4,
    type: "sell" as const,
    isFree: false,
  },
  {
    id: 4,
    image: property4,
    title: "Modern Apartment Complex",
    location: "Addis Ababa, Kazanchis",
    bedrooms: 2,
    bathrooms: 2,
    type: "rent" as const,
    isFree: true,
  },
];

export function FeaturedListings() {
  return (
    <section id="listings" className="py-20 bg-secondary/50">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Popular <span className="text-gradient">Listings</span>
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Discover the most sought-after properties in Addis Ababa. 
              All verified and ready for immediate connection.
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start md:self-auto">
            View All Listings
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PropertyCard {...property} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
