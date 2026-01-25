import { useState } from "react";
import { Hero } from "@/components/Hero";
import { FeaturedListings } from "@/components/FeaturedListings";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties, SearchFilters } from "@/hooks/useProperties";

const Index = () => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const { data: filteredProperties } = useProperties(searchFilters);
  const hasActiveFilters = searchFilters.propertyType || searchFilters.listingType || searchFilters.area;

  const handleSearch = (filters: { propertyType: string; listingType: string; area: string }) => {
    setSearchFilters({
      propertyType: filters.propertyType !== "Property Type" ? filters.propertyType : undefined,
      listingType: filters.listingType !== "Rent / Sell" ? filters.listingType : undefined,
      area: filters.area !== "Location" ? filters.area : undefined,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero onSearch={handleSearch} />
        
        {/* Show filtered results if search was performed */}
        {hasActiveFilters ? (
          <section id="listings" className="py-20 bg-secondary/50">
            <div className="container">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
                    Search <span className="text-gradient">Results</span>
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredProperties?.length || 0} properties found
                  </p>
                </div>
                <button 
                  onClick={() => setSearchFilters({})}
                  className="text-primary hover:underline text-sm"
                >
                  Clear filters
                </button>
              </div>
              
              {filteredProperties && filteredProperties.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProperties.map((property) => {
                    const primaryImage = property.property_images?.find((img) => img.is_primary)?.image_url 
                      || property.property_images?.[0]?.image_url 
                      || "/placeholder.svg";
                    return (
                      <PropertyCard
                        key={property.id}
                        id={property.id}
                        image={primaryImage}
                        title={property.title}
                        location={`${property.city}, ${property.area}`}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        type={property.listing_type}
                        isFree={property.is_available}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p>No properties found matching your criteria.</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <FeaturedListings />
        )}
        
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
