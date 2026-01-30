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
  DollarSign,
  Activity,
  Ban,
  UserX,
  Key,
  Eye,
  ToggleLeft,
  ToggleRight,
  Crown,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Send,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [adminRoles, setAdminRoles] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [banReason, setBanReason] = useState("");
  
  // Admin messaging state
  const [selectedUserForMessage, setSelectedUserForMessage] = useState<any>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sendEmailToo, setSendEmailToo] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

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

      // Fetch admin roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });
      setAdminRoles(rolesData || []);

      // Fetch activity logs
      const { data: logsData } = await supabase
        .from("admin_activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setActivityLogs(logsData || []);

      // Fetch donations
      const { data: donationsData } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      setDonations(donationsData || []);

      // Fetch system settings
      const { data: settingsData } = await supabase
        .from("system_settings")
        .select("*")
        .order("key", { ascending: true });
      setSystemSettings(settingsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const logAdminAction = async (action: string, targetType: string, targetId?: string, details?: any) => {
    try {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user!.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details,
      });
    } catch (error) {
      console.error("Error logging admin action:", error);
    }
  };

  const handleToggleVerified = async (profile: any) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ verified: !profile.verified })
        .eq("id", profile.id);

      if (error) throw error;

      await logAdminAction(
        profile.verified ? "unverify_user" : "verify_user",
        "user",
        profile.user_id,
        { name: profile.name }
      );

      toast({
        title: profile.verified ? "Verification removed" : "User verified",
        description: `${profile.name} has been ${profile.verified ? "unverified" : "verified"}.`,
      });
      
      fetchAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update verification status.", variant: "destructive" });
    }
  };

  const handleBanUser = async (profile: any) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          banned: !profile.banned,
          banned_at: profile.banned ? null : new Date().toISOString(),
          banned_reason: profile.banned ? null : banReason,
        })
        .eq("id", profile.id);

      if (error) throw error;

      await logAdminAction(
        profile.banned ? "unban_user" : "ban_user",
        "user",
        profile.user_id,
        { name: profile.name, reason: banReason }
      );

      toast({
        title: profile.banned ? "User unbanned" : "User banned",
        description: `${profile.name} has been ${profile.banned ? "unbanned" : "banned"}.`,
      });
      
      setBanReason("");
      fetchAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update ban status.", variant: "destructive" });
    }
  };

  const handleResetUserData = async (profile: any) => {
    try {
      // Delete user's properties
      await supabase.from("properties").delete().eq("user_id", profile.user_id);
      
      // Delete user's favorites
      await supabase.from("favorites").delete().eq("user_id", profile.user_id);
      
      // Reset profile fields
      await supabase
        .from("profiles")
        .update({
          verified: false,
          phone_verified: false,
          email_verified: false,
        })
        .eq("id", profile.id);

      await logAdminAction("reset_user_data", "user", profile.user_id, { name: profile.name });

      toast({ title: "User data reset", description: `${profile.name}'s data has been reset.` });
      fetchAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reset user data.", variant: "destructive" });
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await supabase.from("property_images").delete().eq("property_id", propertyId);
      const { error } = await supabase.from("properties").delete().eq("id", propertyId);

      if (error) throw error;

      await logAdminAction("delete_property", "property", propertyId);

      toast({ title: "Property deleted", description: "The property has been removed." });
      fetchAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete property.", variant: "destructive" });
    }
  };

  const handleToggleSetting = async (setting: any) => {
    try {
      const newValue = setting.value === "true" ? "false" : "true";
      const { error } = await supabase
        .from("system_settings")
        .update({ value: newValue, updated_by: user!.id, updated_at: new Date().toISOString() })
        .eq("id", setting.id);

      if (error) throw error;

      await logAdminAction("toggle_setting", "setting", setting.key, { old_value: setting.value, new_value: newValue });

      toast({ title: "Setting updated", description: `${setting.key} is now ${newValue}.` });
      fetchAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update setting.", variant: "destructive" });
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;

    setIsAddingAdmin(true);
    try {
      // Find user by matching profile name (since we can't query auth.users directly)
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, name")
        .ilike("name", `%${newAdminEmail}%`)
        .maybeSingle();

      if (profile) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: profile.user_id, role: "admin" as const });

        if (error) {
          if (error.code === "23505") {
            toast({ title: "Already admin", description: `${profile.name} is already an admin.` });
          } else {
            throw error;
          }
        } else {
          await logAdminAction("add_admin", "user", profile.user_id, { name: profile.name });
          toast({ title: "Admin added", description: `${profile.name} is now an admin.` });
          fetchAllData();
        }
      } else {
        toast({
          title: "User not found",
          description: "No user found with that name. Enter the exact display name.",
          variant: "destructive",
        });
      }
      setNewAdminEmail("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to add admin.", variant: "destructive" });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (role: any) => {
    if (role.user_id === user?.id) {
      toast({ title: "Cannot remove yourself", description: "You cannot remove your own admin access.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", role.id);

      if (error) throw error;

      await logAdminAction("remove_admin", "user", role.user_id);

      toast({ title: "Admin removed", description: "Admin access has been revoked." });
      fetchAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove admin.", variant: "destructive" });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUserForMessage || !messageSubject || !messageContent) return;

    setIsSendingMessage(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-admin-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            recipientId: selectedUserForMessage.user_id,
            subject: messageSubject,
            message: messageContent,
            sendEmail: sendEmailToo,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      toast({
        title: "Message sent",
        description: `Message sent to ${selectedUserForMessage.name}${result.emailSent ? " (email also sent)" : ""}.`,
      });

      setSelectedUserForMessage(null);
      setMessageSubject("");
      setMessageContent("");
      fetchAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
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

  const getProfileByUserId = (userId: string) => {
    return profiles.find((p) => p.user_id === userId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 bg-secondary/30">
        <div className="container">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-gradient">Admin Panel</span>
              </h1>
              <p className="text-muted-foreground">Manage users, properties, and system settings</p>
            </div>
            <Button variant="outline" onClick={fetchAllData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="properties" className="gap-2">
                <Home className="h-4 w-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="donations" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Donations
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Activity className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="admins" className="gap-2">
                <Crown className="h-4 w-4" />
                Admins
              </TabsTrigger>
              <TabsTrigger value="messaging" className="gap-2">
                <Send className="h-4 w-4" />
                Messaging
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold mb-4">User Management ({profiles.length})</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id} className={profile.banned ? "bg-destructive/10" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {profile.name}
                              {profile.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                              {profile.banned && <Badge variant="destructive">Banned</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>{profile.phone || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {profile.verified ? (
                                <span className="text-primary text-xs flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> Verified
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs flex items-center gap-1">
                                  <XCircle className="h-3 w-3" /> Unverified
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(profile.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <Button variant="ghost" size="sm" onClick={() => handleToggleVerified(profile)}>
                                {profile.verified ? <XCircle className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className={profile.banned ? "text-primary" : "text-destructive"}>
                                    {profile.banned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{profile.banned ? "Unban" : "Ban"} {profile.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {profile.banned 
                                        ? "This will restore the user's access to the platform."
                                        : "This will prevent the user from accessing the platform."}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  {!profile.banned && (
                                    <div className="space-y-2">
                                      <Label>Reason (optional)</Label>
                                      <Textarea
                                        value={banReason}
                                        onChange={(e) => setBanReason(e.target.value)}
                                        placeholder="Enter ban reason..."
                                      />
                                    </div>
                                  )}
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleBanUser(profile)}>
                                      {profile.banned ? "Unban" : "Ban"} User
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-amber-600 dark:text-amber-500">
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reset {profile.name}'s Data?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will delete all properties, favorites, and reset verification status. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleResetUserData(profile)} className="bg-destructive">
                                      Reset Data
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
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
                                <Eye className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Property?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this property listing.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProperty(property.id)} className="bg-destructive">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Donations Tab */}
            <TabsContent value="donations">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold mb-4">Donations ({donations.length})</h2>
                {donations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Donor</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donations.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{donation.donor_name || "Anonymous"}</p>
                                <p className="text-sm text-muted-foreground">{donation.donor_email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {donation.amount} {donation.currency}
                            </TableCell>
                            <TableCell>{donation.payment_method || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant={donation.status === "completed" ? "default" : "secondary"}>
                                {donation.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(donation.created_at), "MMM d, yyyy")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No donations recorded yet</p>
                    <p className="text-sm">Donations from Buy Me a Coffee will appear here</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold mb-4">System Settings</h2>
                <div className="space-y-4">
                  {systemSettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{setting.key.replace(/_/g, " ")}</p>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch
                        checked={setting.value === "true"}
                        onCheckedChange={() => handleToggleSetting(setting)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="space-y-6">
                {/* Login History */}
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Login History
                  </h2>
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
                          loginHistory.slice(0, 20).map((login) => (
                            <TableRow key={login.id}>
                              <TableCell className="font-medium">{login.email}</TableCell>
                              <TableCell>
                                {format(new Date(login.logged_in_at), "MMM d, yyyy h:mm a")}
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-sm">
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

                {/* Admin Activity Logs */}
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Admin Activity Logs
                  </h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Admin</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLogs.length > 0 ? (
                          activityLogs.map((log) => {
                            const adminProfile = getProfileByUserId(log.admin_id);
                            return (
                              <TableRow key={log.id}>
                                <TableCell className="font-medium">
                                  {adminProfile?.name || "Unknown"}
                                </TableCell>
                                <TableCell className="capitalize">
                                  {log.action.replace(/_/g, " ")}
                                </TableCell>
                                <TableCell>
                                  {log.target_type}: {log.details?.name || log.target_id?.slice(0, 8) || "N/A"}
                                </TableCell>
                                <TableCell>
                                  {format(new Date(log.created_at), "MMM d, h:mm a")}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              No admin activity logged yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
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
                          Enter the display name of the user you want to make an admin.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>User Display Name</Label>
                          <Input
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            placeholder="Enter user's display name"
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

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminRoles.map((role) => {
                        const profile = getProfileByUserId(role.user_id);
                        return (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {profile?.name || "Unknown"}
                                {role.user_id === user?.id && <Badge>You</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">{role.role}</TableCell>
                            <TableCell>
                              {format(new Date(role.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              {role.user_id !== user?.id && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                      <UserX className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Admin Access?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will revoke admin privileges from {profile?.name}.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleRemoveAdmin(role)} className="bg-destructive">
                                        Remove Admin
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <p className="text-muted-foreground text-sm mt-4">
                  Current admin: {user.email}
                </p>
              </div>
            </TabsContent>

            {/* Messaging Tab */}
            <TabsContent value="messaging">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Message to Users
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Send notifications and emails to users. Messages will appear in their notifications and optionally via email.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* User Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Select User</Label>
                    <div className="max-h-[400px] overflow-y-auto border rounded-lg">
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className={`p-3 border-b cursor-pointer transition-colors hover:bg-secondary/50 ${
                            selectedUserForMessage?.id === profile.id ? "bg-primary/10 border-primary" : ""
                          }`}
                          onClick={() => setSelectedUserForMessage(profile)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {profile.name}
                                {profile.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                              </p>
                              <p className="text-sm text-muted-foreground">{profile.phone || "No phone"}</p>
                            </div>
                            {selectedUserForMessage?.id === profile.id && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Form */}
                  <div className="space-y-4">
                    {selectedUserForMessage ? (
                      <>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Sending message to:</p>
                          <p className="font-semibold">{selectedUserForMessage.name}</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Input
                            value={messageSubject}
                            onChange={(e) => setMessageSubject(e.target.value)}
                            placeholder="e.g., Important Update"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Message</Label>
                          <Textarea
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Write your message here..."
                            rows={5}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={sendEmailToo}
                            onCheckedChange={setSendEmailToo}
                          />
                          <Label className="cursor-pointer">Also send via email</Label>
                        </div>

                        <Button
                          onClick={handleSendMessage}
                          disabled={isSendingMessage || !messageSubject || !messageContent}
                          className="w-full gradient-primary border-0 gap-2"
                        >
                          {isSendingMessage ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Select a user to send a message</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
