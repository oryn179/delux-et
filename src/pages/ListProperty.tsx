import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, DollarSign, MapPin, Bed, Upload, Check, X, Loader2, CheckCircle, AlertTriangle, Sparkles, Shield, Clock, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MapLocationPicker } from "@/components/MapLocationPicker";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useCreateProperty, useUploadPropertyImage, useAddPropertyImage } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { addisAbabaAreas, cities } from "@/data/addisAbabaAreas";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import type { Database } from "@/integrations/supabase/types";

const steps = [
  { id: 1, title: "Type", icon: Home },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Details", icon: Bed },
  { id: 4, title: "Images", icon: Upload },
];

const propertyTypes: { value: Database["public"]["Enums"]["property_type"]; label: string; icon: string }[] = [
  { value: "apartment", label: "Apartment", icon: "🏢" },
  { value: "house", label: "House", icon: "🏠" },
  { value: "villa", label: "Villa", icon: "🏡" },
  { value: "real-estate", label: "Real Estate", icon: "🏗️" },
];

const AMENITIES = [
  { id: "parking", label: "Parking", icon: "🅿️" },
  { id: "garden", label: "Garden", icon: "🌿" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "gym", label: "Gym", icon: "💪" },
  { id: "pool", label: "Pool", icon: "🏊" },
  { id: "elevator", label: "Elevator", icon: "🛗" },
  { id: "balcony", label: "Balcony", icon: "🏞️" },
  { id: "cctv", label: "CCTV", icon: "📹" },
  { id: "internet", label: "Internet", icon: "📶" },
  { id: "generator", label: "Generator", icon: "⚡" },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ListProperty() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProperty = useCreateProperty();
  const uploadImage = useUploadPropertyImage();
  const addPropertyImage = useAddPropertyImage();

  const [currentStep, setCurrentStep] = useState(1);
  const [listingType, setListingType] = useState<Database["public"]["Enums"]["listing_type"] | null>(null);
  const [propertyType, setPropertyType] = useState<Database["public"]["Enums"]["property_type"] | null>(null);
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [furnished, setFurnished] = useState<boolean | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validatingImage, setValidatingImage] = useState<number | null>(null);
  const [imageValidationStatus, setImageValidationStatus] = useState<Record<number, "checking" | "valid" | "invalid">>({});
  const [listingSubmitted, setListingSubmitted] = useState(false);
  const [isLuxury, setIsLuxury] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [moderating, setModerating] = useState(false);

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
            <p className="text-muted-foreground mb-6">Please sign in to list your property.</p>
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

  if (profileLoading) {
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

  if (listingSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8 max-w-lg animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
              <Clock className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: "3s" }} />
            </div>
            <h1 className="text-2xl font-display font-bold mb-3">Listing Under Review</h1>
            <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-left space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Thank you for submitting your listing!</span><br />
                  Your listing is now under review by our AI moderators and team to ensure it meets our quality standards.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">5 AI Moderators</span> are reviewing your listing for content quality and authenticity.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Please allow <span className="font-semibold text-foreground">3 minutes up to 24 hours</span> for approval.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Once approved, your listing will be published and visible to everyone.
                </p>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-primary font-medium">🙏 We appreciate your patience and cooperation.</p>
              <p className="text-xs text-muted-foreground mt-1">You'll receive a notification once your listing is reviewed.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
              <Button onClick={() => navigate("/profile")} className="gradient-primary border-0">View My Profile</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const validateImage = async (file: File, index: number) => {
    setImageValidationStatus((prev) => ({ ...prev, [index]: "checking" }));
    setValidatingImage(index);
    try {
      const base64 = await fileToBase64(file);
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-property-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const result = await response.json();
      setImageValidationStatus((prev) => ({ ...prev, [index]: result.valid ? "valid" : "invalid" }));
      if (!result.valid) {
        toast({ title: "Invalid Image", description: result.reason || "Please upload a real property photo.", variant: "destructive" });
      }
      return result.valid;
    } catch {
      setImageValidationStatus((prev) => ({ ...prev, [index]: "valid" }));
      return true;
    } finally {
      setValidatingImage(null);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({ title: "Too many images", description: "Maximum 5 images allowed.", variant: "destructive" });
      return;
    }
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) { toast({ title: "Invalid file", description: `${file.name} is not an image.`, variant: "destructive" }); return false; }
      if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: `${file.name} exceeds 5MB limit.`, variant: "destructive" }); return false; }
      return true;
    });

    for (const file of validFiles) {
      const newIndex = images.length;
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
      setImages((prev) => [...prev, file]);

      const isValid = await validateImage(file, newIndex);
      if (!isValid) {
        setTimeout(() => {
          setImages((prev) => prev.filter((_, i) => i !== newIndex));
          setImagePreviews((prev) => prev.filter((_, i) => i !== newIndex));
          setImageValidationStatus((prev) => { const next = { ...prev }; delete next[newIndex]; return next; });
        }, 2000);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageValidationStatus((prev) => { const next = { ...prev }; delete next[index]; return next; });
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!user || !listingType || !propertyType || !area || !bedrooms || !bathrooms || furnished === null || !price) {
      toast({ title: "Missing information", description: "Please complete all required fields.", variant: "destructive" });
      return;
    }

    const hasChecking = Object.values(imageValidationStatus).some((s) => s === "checking");
    if (hasChecking) {
      toast({ title: "Please wait", description: "Images are still being checked.", variant: "destructive" });
      return;
    }

    const hasInvalid = Object.values(imageValidationStatus).some((s) => s === "invalid");
    if (hasInvalid) {
      toast({ title: "Invalid images", description: "Please remove invalid images before submitting.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setModerating(true);

    try {
      // AI Moderation check
      const { data: { session } } = await supabase.auth.getSession();
      const modResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moderate-listing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          title, description, price, propertyType, listingType, area,
          amenities: selectedAmenities,
        }),
      });
      const modResult = await modResponse.json();
      setModerating(false);

      if (!modResult.approved) {
        toast({ title: "Listing Not Approved", description: modResult.reason || "Your listing didn't pass content review.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      if (modResult.warnings?.length > 0) {
        toast({ title: "Review Notice", description: modResult.warnings.join(", ") });
      }

      const features = [...selectedAmenities];
      if (isLuxury) features.push("luxury");

      const property = await createProperty.mutateAsync({
        user_id: user.id,
        title: title || `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${area}`,
        description,
        city: city || "Addis Ababa",
        area,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        listing_type: listingType,
        property_type: propertyType,
        furnished,
        price,
        features,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      });
      for (let i = 0; i < images.length; i++) {
        const imageUrl = await uploadImage.mutateAsync({ file: images[i], userId: user.id });
        await addPropertyImage.mutateAsync({ propertyId: property.id, imageUrl, isPrimary: i === 0 });
      }
      setListingSubmitted(true);
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({ title: "Error", description: "Failed to create listing. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setModerating(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return listingType && propertyType;
      case 2: return city && area;
      case 3: return bedrooms && bathrooms && furnished !== null && price;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 bg-secondary/30">
        <div className="container max-w-2xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">List Your Home with Delux</h1>
            <p className="text-muted-foreground">Free. Simple. Trusted in Ethiopia.</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Protected by 5 AI Moderators</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentStep >= step.id ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 mx-1 rounded ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">What would you like to do?</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setListingType("rent")} className={`p-6 rounded-xl border-2 transition-all text-center ${listingType === "rent" ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}>
                      <Home className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">For Rent</p>
                      <p className="text-sm text-muted-foreground">Rent your home</p>
                    </button>
                    <button onClick={() => setListingType("sell")} className={`p-6 rounded-xl border-2 transition-all text-center ${listingType === "sell" ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}>
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
                      <button key={type.value} onClick={() => setPropertyType(type.value)} className={`p-4 rounded-xl border-2 transition-all text-left ${propertyType === type.value ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}>
                        <span className="text-2xl">{type.icon}</span>
                        <p className="font-medium mt-1">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Luxury Toggle */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-semibold text-foreground">Luxury Property</p>
                        <p className="text-xs text-muted-foreground">Mark as premium/luxury listing</p>
                      </div>
                    </div>
                    <Switch checked={isLuxury} onCheckedChange={setIsLuxury} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Choose Property Location</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-11 px-3 rounded-lg bg-secondary border-0 text-sm focus:ring-2 focus:ring-primary/20">
                      <option value="">Select city</option>
                      {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Area</Label>
                    <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full h-11 px-3 rounded-lg bg-secondary border-0 text-sm focus:ring-2 focus:ring-primary/20">
                      <option value="">Select area</option>
                      {addisAbabaAreas.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                {/* Map Picker */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Pin Exact Location (Optional)
                  </Label>
                  <MapLocationPicker
                    area={area}
                    latitude={latitude}
                    longitude={longitude}
                    onLocationChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Property Details</h2>
                <div className="space-y-2">
                  <Label>Title (optional)</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Modern Family Home" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="w-full h-11 px-3 rounded-lg bg-secondary border-0 text-sm focus:ring-2 focus:ring-primary/20">
                      <option value="">Select</option>
                      {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Bedroom" : "Bedrooms"}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="w-full h-11 px-3 rounded-lg bg-secondary border-0 text-sm focus:ring-2 focus:ring-primary/20">
                      <option value="">Select</option>
                      {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Bathroom" : "Bathrooms"}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block">Furnishing</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setFurnished(true)} className={`p-4 rounded-xl border-2 transition-all ${furnished === true ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}>
                      <p className="font-medium">Furnished</p>
                    </button>
                    <button onClick={() => setFurnished(false)} className={`p-4 rounded-xl border-2 transition-all ${furnished === false ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}>
                      <p className="font-medium">Unfurnished</p>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your property..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Price (ETB) <span className="text-destructive">*</span></Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 15000" required />
                  <p className="text-xs text-muted-foreground">Enter the price in Ethiopian Birr</p>
                </div>
                {/* Amenities */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Amenities
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AMENITIES.map((amenity) => (
                      <button
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left text-sm ${
                          selectedAmenities.includes(amenity.id)
                            ? "border-primary bg-accent"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-lg">{amenity.icon}</span>
                        <span className="font-medium">{amenity.label}</span>
                        {selectedAmenities.includes(amenity.id) && (
                          <Check className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Add Photos</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <ScanSearch className="h-4 w-4" />
                    Images are verified by AI to ensure quality property photos
                  </p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      {imageValidationStatus[index] === "checking" && (
                        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                          <ScanSearch className="h-6 w-6 text-primary animate-pulse" />
                          <p className="text-xs font-medium text-primary">Checking image...</p>
                          <Progress value={66} className="w-3/4 h-1.5" />
                        </div>
                      )}
                      {imageValidationStatus[index] === "valid" && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </div>
                      )}
                      {imageValidationStatus[index] === "invalid" && (
                        <div className="absolute inset-0 bg-destructive/20 flex flex-col items-center justify-center gap-1">
                          <AlertTriangle className="h-6 w-6 text-destructive" />
                          <p className="text-xs font-medium text-destructive">Not a property photo</p>
                        </div>
                      )}
                      <button onClick={() => removeImage(index)} className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </button>
                      {index === 0 && <span className="absolute bottom-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Cover</span>}
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors" disabled={validatingImage !== null}>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Upload up to 5 images. First image will be the cover photo. Each image is AI-verified (max ~5 min).</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>Previous</Button>
              ) : <div />}
              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()} className="gradient-primary border-0">Next</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting || validatingImage !== null} className="gradient-primary border-0 gap-2">
                  {moderating ? (
                    <><Shield className="h-4 w-4 animate-pulse" />AI Reviewing...</>
                  ) : isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Creating...</>
                  ) : "Create Listing"}
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
