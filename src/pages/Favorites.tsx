import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites as useFavoritesQuery } from "@/hooks/useFavorites";

export default function Favorites() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: favoritesData, isLoading } = useFavoritesQuery(user?.id);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">Please sign in to view your saved favorites.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
              <Button onClick={() => navigate("/signin")} className="gradient-primary border-0">Sign In</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Extract properties from favorites data
  const favoriteProperties = favoritesData
    ?.map((f) => f.properties)
    .filter((p): p is NonNullable<typeof p> => p !== null) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-display font-bold mb-2">My Favorites</h1>
            <p className="text-muted-foreground">Homes you saved for later</p>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading favorites...</div>
          ) : favoriteProperties.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6">Start exploring and save homes you like!</p>
              <Button onClick={() => navigate("/")} className="gradient-primary border-0">Explore Homes</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProperties.map((property) => {
                const images = property.property_images as Array<{ image_url: string; is_primary: boolean }> | undefined;
                const primaryImage = images?.find((img) => img.is_primary)?.image_url || images?.[0]?.image_url;
                return (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    image={primaryImage || "/placeholder.svg"}
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
