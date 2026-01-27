import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Home,
  Shield,
  Settings,
  LogIn,
  CheckCircle,
  XCircle,
  Trash2,
  Edit2,
  UserPlus,
  Loader2,
  ArrowLeft,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (data) {
        setIsAdmin(true);
        await fetchAllData();
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setProfiles(profilesData || []);

      // Fetch properties with images
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .order("created_at", { ascending: false });
      setProperties(propertiesData || []);

      // Fetch login history
      const { data: loginData } = await supabase
        .from("login_history")
        .select("*")
        .order("logged_in_at", { ascending: false })
        .limit(100);
      setLoginHistory(loginData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleToggleVerified = async (profile: any) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ verified: !profile.verified })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: profile.verified ? "Verification removed" : "User verified",
        description: `${profile.name} has been ${profile.verified ? "unverified" : "verified"}.`,
      });
      
      fetchAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update verification status.", variant: "destructive" });
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      // Delete images first
      await supabase.from("property_images").delete().eq("property_id", propertyId);
      
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);

      if (error) throw error;

      toast({ title: "Property deleted", description: "The property has been removed." });
      fetchAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete property.", variant: "destructive" });
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;

    setIsAddingAdmin(true);
    try {
      // Find user by email in profiles (we don't have direct access to auth.users)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("name", newAdminEmail) // Note: We're matching by name here since we can't query auth.users
        .maybeSingle();

      // For now, we'll show instructions since we can't query auth.users directly
      toast({
        title: "Manual Step Required",
        description: `To add ${newAdminEmail} as admin, use the SQL editor to insert into user_roles table with their user_id.`,
      });
      setNewAdminEmail("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to add admin.", variant: "destructive" });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-display font-bold mb-2">Admin Access Required</h1>
            <p className="text-muted-foreground mb-6">Please sign in to access the admin panel.</p>
            <Button onClick={() => navigate("/signin")} className="gradient-primary border-0">Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center gradient-hero">
          <div className="text-center p-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-display font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You don't have permission to access the admin panel.</p>
            <Button onClick={() => navigate("/")} variant="outline">Go Home</Button>
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

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-gradient">Admin Panel</span>
            </h1>
            <p className="text-muted-foreground">Manage users, properties, and system settings</p>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="properties" className="gap-2">
                <Home className="h-4 w-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="logins" className="gap-2">
                <LogIn className="h-4 w-4" />
                Login History
              </TabsTrigger>
              <TabsTrigger value="admins" className="gap-2">
                <Shield className="h-4 w-4" />
                Admins
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold mb-4">Registered Users ({profiles.length})</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {profile.name}
                              {profile.verified && (
                                <BadgeCheck className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{profile.phone || "N/A"}</TableCell>
                          <TableCell>
                            {profile.verified ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Yes
                              </span>
                            ) : (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <XCircle className="h-4 w-4" />
                                No
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(profile.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleVerified(profile)}
                            >
                              {profile.verified ? "Remove Badge" : "Add Badge"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold mb-4">All Properties ({properties.length})</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">{property.title}</TableCell>
                          <TableCell>{property.city}, {property.area}</TableCell>
                          <TableCell className="capitalize">
                            {property.listing_type} • {property.property_type}
                          </TableCell>
                          <TableCell>
                            {format(new Date(property.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/property/${property.id}`)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Login History Tab */}
            <TabsContent value="logins">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold mb-4">Recent Logins</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>User Agent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loginHistory.length > 0 ? (
                        loginHistory.map((login) => (
                          <TableRow key={login.id}>
                            <TableCell className="font-medium">{login.email}</TableCell>
                            <TableCell>
                              {format(new Date(login.logged_in_at), "MMM d, yyyy h:mm a")}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {login.user_agent || "Unknown"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                            No login history recorded yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Admins Tab */}
            <TabsContent value="admins">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Admin Management</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2 gradient-primary border-0">
                        <UserPlus className="h-4 w-4" />
                        Add Admin
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Admin</DialogTitle>
                        <DialogDescription>
                          Enter the email address of the user you want to make an admin.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            placeholder="user@example.com"
                          />
                        </div>
                        <Button
                          onClick={handleAddAdmin}
                          disabled={isAddingAdmin || !newAdminEmail}
                          className="w-full gradient-primary border-0"
                        >
                          {isAddingAdmin ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Admin"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-muted-foreground text-sm">
                  Current admin: {user.email}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
