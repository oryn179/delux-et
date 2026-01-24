import { useNavigate } from "react-router-dom";
import { Heart, Bed, Bath, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PropertyCardProps {
  id: number;
  image: string;
  title: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  type: "rent" | "sell";
  isFree?: boolean;
}

export function PropertyCard({
  id,
  image,
  title,
  location,
  bedrooms,
  bathrooms,
  type,
  isFree = true,
}: PropertyCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to save favorites.",
      });
      navigate("/signin");
      return;
    }
    toggleFavorite(id);
  };

  const handleViewDetails = () => {
    navigate(`/property/${id}`);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to contact the owner.",
      });
      navigate("/signin");
      return;
    }
    navigate(`/property/${id}`);
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-card border border-border hover:shadow-elevated transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={handleViewDetails}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {isFree && (
            <Badge className="gradient-primary border-0 text-primary-foreground">
              Free
            </Badge>
          )}
          <Badge variant="secondary" className="capitalize">
            {type === "rent" ? "For Rent" : "For Sale"}
          </Badge>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleFavoriteClick}
        >
          <Heart className={`h-4 w-4 ${isFavorite(id) ? "fill-primary text-primary" : ""}`} />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-sm">{location}</span>
        </div>

        <h3 
          className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
          onClick={handleViewDetails}
        >
          {title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4" />
            <span>{bedrooms} Bedrooms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4" />
            <span>{bathrooms} Bathrooms</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleViewDetails}>
            View Details
          </Button>
          <Button size="sm" className="flex-1 gradient-primary border-0" onClick={handleContact}>
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
}
