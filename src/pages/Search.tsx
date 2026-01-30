import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyMap } from "@/components/PropertyMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useProperties, SearchFilters } from "@/hooks/useProperties";
import { addisAbabaAreas } from "@/data/addisAbabaAreas";
import { Search as SearchIcon, SlidersHorizontal, X, Loader2, Map, Grid } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const propertyTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa 🏡" },
  { value: "real-estate", label: "Real Estate" },
];

// Use the comprehensive Addis Ababa areas from data file
const locations = addisAbabaAreas;

const amenities = [
  "Parking",
  "Garden",
  "Security",
  "Gym",
  "Pool",
  "Elevator",
  "Balcony",
  "CCTV",
  "Internet",
  "Generator",
];

export default function Search() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const { data: properties, isLoading } = useProperties(filters);

  const handleSearch = () => {
    setFilters({
      ...filters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 500000 ? priceRange[1] : undefined,
      features: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    });
  };

  const clearFilters = () => {
    setFilters({});
    setPriceRange([0, 500000]);
    setSelectedAmenities([]);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const hasActiveFilters =
    filters.propertyType ||
    filters.listingType ||
    filters.area ||
    filters.bedrooms ||
    filters.furnished !== undefined ||
    priceRange[0] > 0 ||
    priceRange[1] < 500000 ||
    selectedAmenities.length > 0;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Property Type */}
      <div className="space-y-2">
        <Label>Property Type</Label>
        <Select
          value={filters.propertyType || ""}
          onValueChange={(value) =>
            setFilters({ ...filters, propertyType: value || undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Listing Type */}
      <div className="space-y-2">
        <Label>Listing Type</Label>
        <Select
          value={filters.listingType || ""}
          onValueChange={(value) =>
            setFilters({ ...filters, listingType: value || undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Rent / Sell" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
            <SelectItem value="sell">For Sale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Select
          value={filters.area || ""}
          onValueChange={(value) =>
            setFilters({ ...filters, area: value || undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bedrooms */}
      <div className="space-y-2">
        <Label>Bedrooms</Label>
        <Select
          value={filters.bedrooms?.toString() || ""}
          onValueChange={(value) =>
            setFilters({
              ...filters,
              bedrooms: value ? parseInt(value) : undefined,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num}+ Bedroom{num > 1 ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>Price Range (ETB)</Label>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          max={500000}
          step={5000}
          className="py-4"
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={priceRange[0]}
            onChange={(e) =>
              setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
            }
            className="w-full"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], parseInt(e.target.value) || 500000])
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Furnished */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="furnished"
          checked={filters.furnished === true}
          onCheckedChange={(checked) =>
            setFilters({
              ...filters,
              furnished: checked ? true : undefined,
            })
          }
        />
        <Label htmlFor="furnished" className="cursor-pointer">
          Furnished Only
        </Label>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label>Amenities</Label>
        <div className="grid grid-cols-2 gap-2">
          {amenities.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <Label htmlFor={amenity} className="text-sm cursor-pointer">
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSearch} className="flex-1 gradient-primary border-0">
          <SearchIcon className="h-4 w-4 mr-2" />
          Search
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container py-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                Find Your <span className="text-gradient">Perfect Home</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                {properties?.length || 0} properties available
              </p>
            </div>

            {/* View Toggle and Mobile Filters */}
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "map")} className="hidden md:block">
                <TabsList>
                  <TabsTrigger value="grid" className="gap-2">
                    <Grid className="h-4 w-4" />
                    Grid
                  </TabsTrigger>
                  <TabsTrigger value="map" className="gap-2">
                    <Map className="h-4 w-4" />
                    Map
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full px-2">
                        Active
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Narrow down your property search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden md:block">
              <div className="bg-card rounded-xl p-6 shadow-card border border-border sticky top-20">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h2>
                <FilterContent />
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : properties && properties.length > 0 ? (
                <>
                  {viewMode === "map" ? (
                    <PropertyMap properties={properties} className="h-[600px]" />
                  ) : (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {properties.map((property) => {
                        const primaryImage =
                          property.property_images?.find((img) => img.is_primary)
                            ?.image_url ||
                          property.property_images?.[0]?.image_url ||
                          "/placeholder.svg";
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
                            price={property.price}
                            isFree={property.is_available ?? false}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to see more results
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
