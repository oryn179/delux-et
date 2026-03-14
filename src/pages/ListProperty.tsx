import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, DollarSign, MapPin, Bed, Upload, Check, X, Loader2, ShieldAlert, Clock, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useOwnerRequest } from "@/hooks/useOwnerRequest";
import { useCreateProperty, useUploadPropertyImage, useAddPropertyImage } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { addisAbabaAreas, cities } from "@/data/addisAbabaAreas";
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

export default function ListProperty() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: ownerRequest, isLoading: ownerLoading } = useOwnerRequest(user?.id);
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

  // Show loading while checking
  if (profileLoading || ownerLoading) {
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

  // Owner request banned
  if (ownerRequest?.status === "banned") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8 max-w-md animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-destructive/10 mx-auto mb-6 flex items-center justify-center">
              <Ban className="h-10 w-10 text-destructive animate-pulse" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-3 text-destructive">Request Denied</h1>
            <p className="text-muted-foreground mb-6">
              Please don't try this again, you're doing something wrong.
            </p>
            {ownerRequest?.admin_note && (
              <p className="text-sm text-muted-foreground bg-destructive/5 rounded-xl p-4 mb-6">
                {ownerRequest.admin_note}
              </p>
            )}
            <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Owner request pending
  if (ownerRequest?.status === "pending") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8 max-w-md animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-6 flex items-center justify-center">
              <Clock className="h-10 w-10 text-primary animate-spin" style={{ animationDuration: "3s" }} />
            </div>
            <h1 className="text-2xl font-display font-bold mb-3">Under Review</h1>
            <p className="text-muted-foreground mb-6">
              The information you entered has been sent successfully. Please wait a moment while we process and verify your information.
            </p>
            <div className="bg-secondary/50 rounded-xl p-4 mb-6">
              <p className="text-xs text-muted-foreground">This usually takes a few hours. You'll be notified once approved.</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No owner request at all - need to submit one first
  if (!ownerRequest) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto mb-4 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Home Owner Verification Required</h1>
            <p className="text-muted-foreground mb-6">
              To post property listings, you need to register as a Home Owner. Please sign in as a Home Owner to submit your request for approval.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
              <Button onClick={() => navigate("/signin")} className="gradient-primary border-0">
                Sign In as Owner
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Owner is approved - show the listing form
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setImages((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user || !listingType || !propertyType || !area || !bedrooms || !bathrooms || furnished === null) {
      toast({ title: "Missing information", description: "Please complete all required fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
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
        price: price || null,
      });
      for (let i = 0; i < images.length; i++) {
        const imageUrl = await uploadImage.mutateAsync({ file: images[i], userId: user.id });
        await addPropertyImage.mutateAsync({ propertyId: property.id, imageUrl, isPrimary: i === 0 });
      }
      toast({ title: "Listing Created!", description: "Your property has been listed successfully." });
      navigate("/profile");
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({ title: "Error", description: "Failed to create listing. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return listingType && propertyType;
      case 2: return city && area;
      case 3: return bedrooms && bathrooms && furnished !== null;
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
                  <Label>Price (ETB) - Optional</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 15000" />
                  <p className="text-xs text-muted-foreground">Leave empty if you want to discuss the price with interested parties</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Add Photos</h2>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(index)} className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </button>
                      {index === 0 && <span className="absolute bottom-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Cover</span>}
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Upload up to 5 images. First image will be the cover photo.</p>
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
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gradient-primary border-0 gap-2">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : "Create Listing"}
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
