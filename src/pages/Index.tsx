import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { CheckCircle } from "lucide-react";
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
      <Helmet>
        <title>Delux ET – Find Houses in Ethiopia Without Commission</title>
        <meta name="description" content="Delux ET is a free platform to find houses in Ethiopia without agents or commission. Browse homes easily and contact owners directly." />
        <meta name="keywords" content="Delux ET, houses in Ethiopia, rent house Ethiopia, buy house Ethiopia, no commission homes Ethiopia" />
        <link rel="canonical" href="https://delux-et.lovable.app/" />
        <meta property="og:title" content="Delux ET – Find Houses in Ethiopia Without Commission" />
        <meta property="og:description" content="Find houses in Ethiopia without paying commission. Browse, contact owners directly." />
        <meta property="og:url" content="https://delux-et.lovable.app/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Delux ET – Free Home Platform" />
        <meta name="twitter:description" content="Find homes without commission in Ethiopia." />
      </Helmet>
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
                        features={property.features}
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
        
        {/* SEO Content Section */}
        <section className="py-16 bg-background">
          <div className="container max-w-4xl">
            <p className="text-center text-muted-foreground text-lg mb-12">
              Delux ET helps you find apartments, houses, and villas for rent or sale across Addis Ababa and Ethiopia — completely free, with no agents or commissions.
            </p>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">No Commission Fees</h3>
                <p className="text-sm text-muted-foreground">Browse and list properties for free. No hidden charges or agent fees.</p>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Contact Owners Directly</h3>
                <p className="text-sm text-muted-foreground">Skip the middleman. Message property owners directly through our platform.</p>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">AI-Verified Listings</h3>
                <p className="text-sm text-muted-foreground">Every listing is reviewed by AI moderators for quality and authenticity.</p>
              </div>
            </div>
          </div>
        </section>

        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
