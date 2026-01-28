import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Scale, X, Bed, Bath, Check, Minus, MapPin, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCompare } from "@/contexts/CompareContext";
import { usePropertiesByIds } from "@/hooks/useProperties";
import { Loader2 } from "lucide-react";

export default function Compare() {
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { data: properties, isLoading } = usePropertiesByIds(compareList);

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">No Properties to Compare</h1>
            <p className="text-muted-foreground mb-6">
              Add properties to compare by clicking the compare button on property cards.
            </p>
            <Button onClick={() => navigate("/search")} className="gradient-primary border-0">
              Browse Properties
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 bg-secondary/30">
        <div className="container">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">
                <span className="text-gradient">Compare Properties</span>
              </h1>
              <p className="text-muted-foreground">
                Comparing {compareList.length} properties side by side
              </p>
            </div>
            <Button variant="outline" onClick={clearCompare}>
              Clear All
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="text-left p-4 bg-card border-b border-border w-48">
                      Property
                    </th>
                    {properties.map((property) => {
                      const primaryImage =
                        property.property_images?.find((img: any) => img.is_primary)
                          ?.image_url ||
                        property.property_images?.[0]?.image_url ||
                        "/placeholder.svg";

                      return (
                        <th
                          key={property.id}
                          className="p-4 bg-card border-b border-border min-w-[200px]"
                        >
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCompare(property.id)}
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <Link to={`/property/${property.id}`}>
                              <img
                                src={primaryImage}
                                alt={property.title}
                                className="w-full h-32 object-cover rounded-lg mb-3"
                              />
                              <h3 className="font-semibold text-sm line-clamp-2">
                                {property.title}
                              </h3>
                            </Link>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {/* Location */}
                  <tr>
                    <td className="p-4 font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Location
                    </td>
                    {properties.map((property) => (
                      <td key={property.id} className="p-4 text-center">
                        {property.city}, {property.area}
                      </td>
                    ))}
                  </tr>

                  {/* Type */}
                  <tr className="bg-card/50">
                    <td className="p-4 font-medium flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      Type
                    </td>
                    {properties.map((property) => (
                      <td key={property.id} className="p-4 text-center capitalize">
                        {property.property_type} • {property.listing_type}
                      </td>
                    ))}
                  </tr>

                  {/* Bedrooms */}
                  <tr>
                    <td className="p-4 font-medium flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      Bedrooms
                    </td>
                    {properties.map((property) => (
                      <td key={property.id} className="p-4 text-center">
                        {property.bedrooms}
                      </td>
                    ))}
                  </tr>

                  {/* Bathrooms */}
                  <tr className="bg-card/50">
                    <td className="p-4 font-medium flex items-center gap-2">
                      <Bath className="h-4 w-4 text-muted-foreground" />
                      Bathrooms
                    </td>
                    {properties.map((property) => (
                      <td key={property.id} className="p-4 text-center">
                        {property.bathrooms}
                      </td>
                    ))}
                  </tr>

                  {/* Furnished */}
                  <tr>
                    <td className="p-4 font-medium">Furnished</td>
                    {properties.map((property) => (
                      <td key={property.id} className="p-4 text-center">
                        {property.furnished ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Available */}
                  <tr className="bg-card/50">
                    <td className="p-4 font-medium">Available</td>
                    {properties.map((property) => (
                      <td key={property.id} className="p-4 text-center">
                        {property.is_available ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Features */}
                  <tr>
                    <td className="p-4 font-medium">Features</td>
                    {properties.map((property) => (
                      <td key={property.id} className="p-4 text-center">
                        {property.features && property.features.length > 0 ? (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {property.features.slice(0, 3).map((feature: string) => (
                              <span
                                key={feature}
                                className="text-xs bg-secondary px-2 py-1 rounded"
                              >
                                {feature}
                              </span>
                            ))}
                            {property.features.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{property.features.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Action */}
                  <tr className="bg-card/50">
                    <td className="p-4 font-medium">Action</td>
                    {properties.map((property) => (
                      <td key={property.id} className="p-4 text-center">
                        <Button
                          asChild
                          size="sm"
                          className="gradient-primary border-0"
                        >
                          <Link to={`/property/${property.id}`}>View Details</Link>
                        </Button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>Failed to load properties</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
