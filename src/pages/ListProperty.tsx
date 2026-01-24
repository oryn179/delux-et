import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, DollarSign, MapPin, Bed, Bath, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Type", icon: Home },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Details", icon: Bed },
  { id: 4, title: "Images", icon: Upload },
];

const propertyTypes = [
  { value: "apartment", label: "Apartment", icon: "🏢" },
  { value: "house", label: "House", icon: "🏠" },
  { value: "villa", label: "Villa", icon: "🏡" },
  { value: "real-estate", label: "Real Estate", icon: "🏗️" },
];

const cities = ["Addis Ababa"];
const areas = ["Bole", "Piassa Arada", "Kazanchis", "CMC", "Megenagna", "Sidist Kilo", "Sarbet", "Mexico"];

export default function ListProperty() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [listingType, setListingType] = useState<"rent" | "sell" | null>(null);
  const [propertyType, setPropertyType] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [furnished, setFurnished] = useState<boolean | null>(null);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
              <Home className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to list your property.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                Go Home
              </Button>
              <Button onClick={() => navigate("/signin")} className="gradient-primary border-0">
                Sign In
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = () => {
    toast({
      title: "Listing Created!",
      description: "Your property has been listed successfully. (Demo mode)",
    });
    navigate("/profile");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return listingType && propertyType;
      case 2:
        return city && area;
      case 3:
        return bedrooms && bathrooms && furnished !== null;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 bg-secondary/30">
        <div className="container max-w-2xl">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">List Your Home with Delux</h1>
            <p className="text-muted-foreground">Free. Simple. Trusted in Ethiopia.</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStep >= step.id
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-1 mx-1 rounded ${
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border">
            {/* Step 1: Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">What would you like to do?</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setListingType("rent")}
                      className={`p-6 rounded-xl border-2 transition-all text-center ${
                        listingType === "rent"
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Home className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">For Rent</p>
                      <p className="text-sm text-muted-foreground">Rent your home</p>
                    </button>
                    <button
                      onClick={() => setListingType("sell")}
                      className={`p-6 rounded-xl border-2 transition-all text-center ${
                        listingType === "sell"
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">For Sell</p>
                      <p className="text-sm text-muted-foreground">Sell your property</p>
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Property Type</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setPropertyType(type.value)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          propertyType === type.value
                            ? "border-primary bg-accent"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <p className="font-medium mt-1">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Choose Property Location</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-secondary border-0 text-sm focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select city</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Area</Label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-secondary border-0 text-sm focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select area</option>
                      {areas.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Property Details</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-secondary border-0 text-sm focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "Bedroom" : "Bedrooms"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-secondary border-0 text-sm focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "Bathroom" : "Bathrooms"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Furnishing</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFurnished(true)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        furnished === true
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium">Furnished</p>
                    </button>
                    <button
                      onClick={() => setFurnished(false)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        furnished === false
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium">Unfurnished</p>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your property..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Images */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Add Photos</h2>

                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-1">Upload Images</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop or click to browse
                  </p>
                  <Button variant="outline">Choose Files</Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Coming Soon: Image upload will be available with backend integration
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={!canProceed()}
                  className="gradient-primary border-0"
                >
                  Continue Listing
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="gradient-primary border-0">
                  Publish Listing
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
