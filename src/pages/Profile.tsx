import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, Settings, HelpCircle, LogOut, Edit2, Home, Plus, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useUserProperties, useDeleteProperty } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const { toast } = useToast();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: userProperties, isLoading: propertiesLoading } = useUserProperties(user?.id);
  const updateProfile = useUpdateProfile();
  const deleteProperty = useDeleteProperty();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Sync form state when profile loads
  if (profile && !isEditing && name === "" && phone === "") {
    setName(profile.name);
    setPhone(profile.phone || "");
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8">
            <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">Please sign in to view your profile.</p>
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

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await updateProfile.mutateAsync({ userId: user.id, updates: { name, phone } });
      setIsEditing(false);
      toast({ title: "Profile updated", description: "Your profile has been updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: "Logged out", description: "You have been logged out successfully." });
      navigate("/");
    } catch {
      toast({ title: "Error", description: "Failed to log out.", variant: "destructive" });
    }
  };

  const handleDeleteListing = async (propertyId: string) => {
    try {
      await deleteProperty.mutateAsync(propertyId);
      toast({ title: "Listing deleted", description: "Your property listing has been removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete listing.", variant: "destructive" });
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading profile...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 bg-secondary/30">
        <div className="container max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
                    {profile?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>
                <h2 className="text-xl font-semibold">{profile?.name || "User"}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>

                <div className="mt-6 space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/list-property")}>
                    <Plus className="h-4 w-4" />
                    Create Listing
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/favorites")}>
                    <Home className="h-4 w-4" />
                    My Favorites
                  </Button>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="md:col-span-2 space-y-6">
              {/* General Information */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">General Information</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2">
                    <Edit2 className="h-4 w-4" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    {isEditing ? (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{profile?.name || "Not set"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                      <span className="text-xs text-muted-foreground ml-auto">(Read-only)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    {isEditing ? (
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" placeholder="+251 91 234 5678" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile?.phone || "Not set"}</span>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <Button onClick={handleSaveProfile} className="gradient-primary border-0" disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                </div>
              </div>

              {/* My Listings */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h3 className="text-lg font-semibold mb-4">My Listings</h3>
                {propertiesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading listings...</div>
                ) : userProperties && userProperties.length > 0 ? (
                  <div className="space-y-3">
                    {userProperties.map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {property.city}, {property.area} • {property.bedrooms} bed • {property.bathrooms} bath
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/property/${property.id}`}>View</Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteListing(property.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>You haven't posted any listings yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate("/list-property")}>
                      Create Your First Listing
                    </Button>
                  </div>
                )}
              </div>

              {/* Account Actions */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h3 className="text-lg font-semibold mb-4">Account</h3>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                    <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Support
                    <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
