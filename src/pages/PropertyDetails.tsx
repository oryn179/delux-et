import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Heart, Bed, Bath, MapPin, Check, Phone, Share2, Shield, ChevronLeft, ChevronRight, Loader2, MessageCircle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCompare } from "@/contexts/CompareContext";
import { useProperty, useOwnerProfile } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { ContactOwnerDialog } from "@/components/ContactOwnerDialog";
import { ReviewSection } from "@/components/ReviewSection";
import { CompareButton } from "@/components/CompareButton";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();

  const { data: property, isLoading } = useProperty(id || "");
  const { data: ownerProfile } = useOwnerProfile(property?.user_id);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = property.property_images?.map((img) => img.image_url) ?? ["/placeholder.svg"];

  const handleViewPhone = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to view the owner's phone number.",
      });
      navigate("/signin", { state: { from: { pathname: `/property/${id}` } } });
      return;
    }
    setShowPhone(true);
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to save properties to favorites.",
      });
      navigate("/signin", { state: { from: { pathname: `/property/${id}` } } });
      return;
    }
    toggleFavorite(property.id);
    toast({
      title: isFavorite(property.id) ? "Removed from favorites" : "Added to favorites",
      description: isFavorite(property.id)
        ? "Property removed from your favorites."
        : "Property saved to your favorites.",
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Back Button */}
        <div className="container py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="container pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2 space-y-4">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-muted">
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.is_available && (
                    <Badge className="gradient-primary border-0 text-primary-foreground">Free</Badge>
                  )}
                  <Badge variant="secondary" className="capitalize">
                    {property.listing_type === "rent" ? "For Rent" : "For Sale"}
                  </Badge>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur rounded-full px-3 py-1 text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description || "No description provided."}
                </p>
              </div>

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <h2 className="text-xl font-semibold mb-4">Features</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <ReviewSection
                  ownerId={property.user_id}
                  ownerName={ownerProfile?.name || "Owner"}
                  propertyId={property.id}
                />
              </div>
            </div>

            {/* Right Column - Info & Actions */}
            <div className="space-y-4">
              {/* Property Info Card */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border sticky top-20">
                <div className="space-y-4">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-1 shrink-0" />
                    <span>{property.city}, {property.area}</span>
                  </div>

                  <h1 className="text-2xl font-display font-bold">{property.title}</h1>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4" />
                      <span>{property.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4" />
                      <span>{property.bathrooms} Bathrooms</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {property.property_type}
                    </Badge>
                    <Badge variant="secondary">
                      {property.furnished ? "Furnished" : "Unfurnished"}
                    </Badge>
                  </div>

                  {property.price && (
                    <div className="text-2xl font-bold text-primary">{property.price}</div>
                  )}

                  {/* Owner Info */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Posted by</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{ownerProfile?.name || "Owner"}</p>
                          {ownerProfile?.verified && (
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <Shield className="h-3 w-3" />
                              Verified
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {showPhone && ownerProfile?.phone ? (
                      <div className="bg-accent rounded-lg p-3 text-center mb-3">
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                        <p className="font-semibold text-lg">{ownerProfile.phone}</p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleViewPhone}
                        className="w-full gradient-primary border-0 gap-2 mb-3"
                      >
                        <Phone className="h-4 w-4" />
                        View Phone Number
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast({
                            title: "Login Required",
                            description: "Please sign in to contact the owner.",
                          });
                          navigate("/signin", { state: { from: { pathname: `/property/${id}` } } });
                          return;
                        }
                        setShowContactDialog(true);
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact Owner
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={handleToggleFavorite}
                    >
                      <Heart
                        className={`h-4 w-4 ${isFavorite(property.id) ? "fill-primary text-primary" : ""}`}
                      />
                      {isFavorite(property.id) ? "Saved" : "Save"}
                    </Button>
                    <CompareButton propertyId={property.id} />
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Login reminder */}
                  {!isAuthenticated && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      <Link to="/signin" className="text-primary hover:underline">
                        Sign in
                      </Link>{" "}
                      to contact the owner
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <ContactOwnerDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        propertyId={property.id}
        propertyTitle={property.title}
        ownerId={property.user_id}
        ownerName={ownerProfile?.name || "Owner"}
        ownerEmail={ownerProfile?.user_id || ""}
      />
    </div>
  );
}
