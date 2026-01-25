import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";

export function FeaturedListings() {
  const { data: properties, isLoading } = useProperties();

  // Show only first 4 properties
  const featuredProperties = properties?.slice(0, 4) ?? [];

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
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-card border border-border animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-5 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="mb-4">No properties listed yet.</p>
            <Button variant="outline" asChild>
              <a href="/list-property">Be the first to list a property</a>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property, index) => {
              const primaryImage = property.property_images?.find((img) => img.is_primary)?.image_url 
                || property.property_images?.[0]?.image_url 
                || "/placeholder.svg";
              return (
                <div
                  key={property.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PropertyCard
                    id={property.id}
                    image={primaryImage}
                    title={property.title}
                    location={`${property.city}, ${property.area}`}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    type={property.listing_type}
                    isFree={property.is_available}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
