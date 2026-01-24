import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { properties } from "@/data/properties";

export function FeaturedListings() {
  // Show only first 4 properties
  const featuredProperties = properties.slice(0, 4);

  return (
    <section id="listings" className="py-20 bg-secondary/50">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Finding the Most <span className="text-gradient">Popular Homes</span>
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
          {featuredProperties.map((property, index) => (
            <div
              key={property.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PropertyCard
                id={property.id}
                image={property.image}
                title={property.title}
                location={property.location}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                type={property.type}
                isFree={property.isFree}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
