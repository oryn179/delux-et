import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Home, Shield, Settings, LogIn, CheckCircle, XCircle, Trash2,
  Edit2, UserPlus, Loader2, ArrowLeft, BadgeCheck, DollarSign, Activity,
  Ban, UserX, Key, Eye, ToggleLeft, ToggleRight, Crown, AlertTriangle,
  LogOut, RefreshCw, Send, Mail, BarChart3, Rocket,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

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
  const [propertyViews, setPropertyViews] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Admin messaging state
  const [selectedUserForMessage, setSelectedUserForMessage] = useState<any>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sendEmailToo, setSendEmailToo] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Coming Soon editor state
  const [comingSoonTitle, setComingSoonTitle] = useState("Coming Soon");
  const [comingSoonMessage, setComingSoonMessage] = useState("Mobile app, advanced filters & more features are on the way!");
  const [isSavingComingSoon, setIsSavingComingSoon] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (data) { setIsAdmin(true); await fetchAllData(); }
    } catch (error) { console.error("Error checking admin status:", error); }
    finally { setIsLoading(false); }
  };

  const fetchAllData = async () => {
    try {
      const [profilesRes, propertiesRes, loginRes, rolesRes, logsRes, donationsRes, settingsRes, viewsRes, messagesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("properties").select("*, property_images(*)").order("created_at", { ascending: false }),
        supabase.from("login_history").select("*").order("logged_in_at", { ascending: false }).limit(100),
        supabase.from("user_roles").select("*").order("created_at", { ascending: false }),
        supabase.from("admin_activity_logs").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("donations").select("*").order("created_at", { ascending: false }),
        supabase.from("system_settings").select("*").order("key", { ascending: true }),
        supabase.from("property_views").select("*").order("viewed_at", { ascending: false }).limit(500),
        supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(200),
      ]);

      setProfiles(profilesRes.data || []);
      setProperties(propertiesRes.data || []);
      setLoginHistory(loginRes.data || []);
      setAdminRoles(rolesRes.data || []);
      setActivityLogs(logsRes.data || []);
      setDonations(donationsRes.data || []);
      setSystemSettings(settingsRes.data || []);
      setPropertyViews(viewsRes.data || []);
      setMessages(messagesRes.data || []);

      // Load coming soon settings
      const titleSetting = (settingsRes.data || []).find((s: any) => s.key === "coming_soon_title");
      const msgSetting = (settingsRes.data || []).find((s: any) => s.key === "coming_soon_message");
      if (titleSetting?.value) setComingSoonTitle(String(titleSetting.value).replace(/^"|"$/g, ''));
      if (msgSetting?.value) setComingSoonMessage(String(msgSetting.value).replace(/^"|"$/g, ''));
    } catch (error) { console.error("Error fetching data:", error); }
  };

  const logAdminAction = async (action: string, targetType: string, targetId?: string, details?: any) => {
    try {
      await supabase.from("admin_activity_logs").insert({ admin_id: user!.id, action, target_type: targetType, target_id: targetId, details });
    } catch (error) { console.error("Error logging admin action:", error); }
  };

  const handleToggleVerified = async (profile: any) => {
    try {
      const { error } = await supabase.from("profiles").update({ verified: !profile.verified }).eq("id", profile.id);
      if (error) throw error;
      await logAdminAction(profile.verified ? "unverify_user" : "verify_user", "user", profile.user_id, { name: profile.name });
      toast({ title: profile.verified ? "Verification removed" : "User verified", description: `${profile.name} has been ${profile.verified ? "unverified" : "verified"}.` });
      fetchAllData();
    } catch (error) { toast({ title: "Error", description: "Failed to update verification status.", variant: "destructive" }); }
  };

  const handleBanUser = async (profile: any) => {
    try {
      const { error } = await supabase.from("profiles").update({ banned: !profile.banned, banned_at: profile.banned ? null : new Date().toISOString(), banned_reason: profile.banned ? null : banReason }).eq("id", profile.id);
      if (error) throw error;
      await logAdminAction(profile.banned ? "unban_user" : "ban_user", "user", profile.user_id, { name: profile.name, reason: banReason });
      toast({ title: profile.banned ? "User unbanned" : "User banned", description: `${profile.name} has been ${profile.banned ? "unbanned" : "banned"}.` });
      setBanReason(""); fetchAllData();
    } catch (error) { toast({ title: "Error", description: "Failed to update ban status.", variant: "destructive" }); }
  };

  const handleResetUserData = async (profile: any) => {
    try {
      await supabase.from("properties").delete().eq("user_id", profile.user_id);
      await supabase.from("favorites").delete().eq("user_id", profile.user_id);
      await supabase.from("profiles").update({ verified: false, phone_verified: false, email_verified: false }).eq("id", profile.id);
      await logAdminAction("reset_user_data", "user", profile.user_id, { name: profile.name });
      toast({ title: "User data reset", description: `${profile.name}'s data has been reset.` }); fetchAllData();
    } catch (error) { toast({ title: "Error", description: "Failed to reset user data.", variant: "destructive" }); }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await supabase.from("property_images").delete().eq("property_id", propertyId);
      const { error } = await supabase.from("properties").delete().eq("id", propertyId);
      if (error) throw error;
      await logAdminAction("delete_property", "property", propertyId);
      toast({ title: "Property deleted", description: "The property has been removed." }); fetchAllData();
    } catch (error) { toast({ title: "Error", description: "Failed to delete property.", variant: "destructive" }); }
  };

  const handleToggleSetting = async (setting: any) => {
    try {
      const newValue = setting.value === "true" ? "false" : "true";
      const { error } = await supabase.from("system_settings").update({ value: newValue, updated_by: user!.id, updated_at: new Date().toISOString() }).eq("id", setting.id);
      if (error) throw error;
      await logAdminAction("toggle_setting", "setting", setting.key, { old_value: setting.value, new_value: newValue });
      toast({ title: "Setting updated", description: `${setting.key} is now ${newValue}.` }); fetchAllData();
    } catch (error) { toast({ title: "Error", description: "Failed to update setting.", variant: "destructive" }); }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;
    setIsAddingAdmin(true);
    try {
      const { data: profile } = await supabase.from("profiles").select("user_id, name").ilike("name", `%${newAdminEmail}%`).maybeSingle();
      if (profile) {
        const { error } = await supabase.from("user_roles").insert({ user_id: profile.user_id, role: "admin" as const });
        if (error) {
          if (error.code === "23505") toast({ title: "Already admin", description: `${profile.name} is already an admin.` });
          else throw error;
        } else {
          await logAdminAction("add_admin", "user", profile.user_id, { name: profile.name });
          toast({ title: "Admin added", description: `${profile.name} is now an admin.` }); fetchAllData();
        }
      } else {
        toast({ title: "User not found", description: "No user found with that name.", variant: "destructive" });
      }
      setNewAdminEmail("");
    } catch (error) { toast({ title: "Error", description: "Failed to add admin.", variant: "destructive" }); }
    finally { setIsAddingAdmin(false); }
  };

  const handleRemoveAdmin = async (role: any) => {
    if (role.user_id === user?.id) { toast({ title: "Cannot remove yourself", variant: "destructive" }); return; }
    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", role.id);
      if (error) throw error;
      await logAdminAction("remove_admin", "user", role.user_id);
      toast({ title: "Admin removed" }); fetchAllData();
    } catch (error) { toast({ title: "Error", description: "Failed to remove admin.", variant: "destructive" }); }
  };

  const handleSendMessage = async () => {
    if (!selectedUserForMessage || !messageSubject || !messageContent) return;
    setIsSendingMessage(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-admin-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ recipientId: selectedUserForMessage.user_id, subject: messageSubject, message: messageContent, sendEmail: sendEmailToo }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to send message");
      toast({ title: "Message sent", description: `Message sent to ${selectedUserForMessage.name}${result.emailSent ? " (email also sent)" : ""}.` });
      setSelectedUserForMessage(null); setMessageSubject(""); setMessageContent(""); fetchAllData();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setIsSendingMessage(false); }
  };

  const handleSaveComingSoon = async () => {
    setIsSavingComingSoon(true);
    try {
      // Upsert title
      const { data: existingTitle } = await supabase.from("system_settings").select("id").eq("key", "coming_soon_title").maybeSingle();
      if (existingTitle) {
        await supabase.from("system_settings").update({ value: JSON.stringify(comingSoonTitle), updated_by: user!.id, updated_at: new Date().toISOString() }).eq("id", existingTitle.id);
      } else {
        await supabase.from("system_settings").insert({ key: "coming_soon_title", value: JSON.stringify(comingSoonTitle), description: "Coming Soon widget title", updated_by: user!.id });
      }
      // Upsert message
      const { data: existingMsg } = await supabase.from("system_settings").select("id").eq("key", "coming_soon_message").maybeSingle();
      if (existingMsg) {
        await supabase.from("system_settings").update({ value: JSON.stringify(comingSoonMessage), updated_by: user!.id, updated_at: new Date().toISOString() }).eq("id", existingMsg.id);
      } else {
        await supabase.from("system_settings").insert({ key: "coming_soon_message", value: JSON.stringify(comingSoonMessage), description: "Coming Soon widget message", updated_by: user!.id });
      }
      await logAdminAction("update_coming_soon", "setting", "coming_soon");
      toast({ title: "Coming Soon updated", description: "The widget content has been saved." });
      fetchAllData();
    } catch (error) { toast({ title: "Error", description: "Failed to save.", variant: "destructive" }); }
    finally { setIsSavingComingSoon(false); }
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
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main>
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

  const getProfileByUserId = (userId: string) => profiles.find((p) => p.user_id === userId);

  // Analytics data
  const verifiedUsers = profiles.filter(p => p.verified).length;
  const bannedUsers = profiles.filter(p => p.banned).length;
  const totalViews = propertyViews.length;
  const totalMessages = messages.length;

  const propertyTypeData = [
    { name: "Apartment", value: properties.filter(p => p.property_type === "apartment").length },
    { name: "House", value: properties.filter(p => p.property_type === "house").length },
    { name: "Villa", value: properties.filter(p => p.property_type === "villa").length },
    { name: "Real Estate", value: properties.filter(p => p.property_type === "real-estate").length },
  ].filter(d => d.value > 0);

  const listingTypeData = [
    { name: "For Rent", value: properties.filter(p => p.listing_type === "rent").length },
    { name: "For Sale", value: properties.filter(p => p.listing_type === "sell").length },
  ].filter(d => d.value > 0);

  // User registrations by month (last 6 months)
  const monthlyUsers: Record<string, number> = {};
  profiles.forEach(p => {
    const month = format(new Date(p.created_at), "MMM yyyy");
    monthlyUsers[month] = (monthlyUsers[month] || 0) + 1;
  });
  const userGrowthData = Object.entries(monthlyUsers).slice(-6).map(([month, count]) => ({ month, users: count }));

  // Views by day (last 7 days)
  const dailyViews: Record<string, number> = {};
  propertyViews.forEach(v => {
    const day = format(new Date(v.viewed_at), "MMM d");
    dailyViews[day] = (dailyViews[day] || 0) + 1;
  });
  const viewsData = Object.entries(dailyViews).slice(-7).map(([day, views]) => ({ day, views }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 bg-secondary/30">
        <div className="container">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" /> Back
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
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4" />Analytics</TabsTrigger>
              <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Users</TabsTrigger>
              <TabsTrigger value="properties" className="gap-2"><Home className="h-4 w-4" />Properties</TabsTrigger>
              <TabsTrigger value="donations" className="gap-2"><DollarSign className="h-4 w-4" />Donations</TabsTrigger>
              <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" />Settings</TabsTrigger>
              <TabsTrigger value="security" className="gap-2"><Activity className="h-4 w-4" />Security</TabsTrigger>
              <TabsTrigger value="admins" className="gap-2"><Crown className="h-4 w-4" />Admins</TabsTrigger>
              <TabsTrigger value="messaging" className="gap-2"><Send className="h-4 w-4" />Messaging</TabsTrigger>
              <TabsTrigger value="comingsoon" className="gap-2"><Rocket className="h-4 w-4" />Coming Soon</TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users", value: profiles.length, icon: Users, color: "text-primary" },
                    { label: "Total Properties", value: properties.length, icon: Home, color: "text-primary" },
                    { label: "Property Views", value: totalViews, icon: Eye, color: "text-primary" },
                    { label: "Messages", value: totalMessages, icon: Mail, color: "text-primary" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-2xl p-6 shadow-card border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Verified Users", value: verifiedUsers },
                    { label: "Banned Users", value: bannedUsers },
                    { label: "Admins", value: adminRoles.length },
                    { label: "Donations", value: donations.length },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 shadow-card border border-border">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Property Type Distribution */}
                  <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                    <h3 className="font-semibold mb-4">Property Types</h3>
                    {propertyTypeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={propertyTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {propertyTypeData.map((_, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <p className="text-center text-muted-foreground py-8">No data</p>}
                  </div>

                  {/* Listing Type */}
                  <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                    <h3 className="font-semibold mb-4">Listing Types</h3>
                    {listingTypeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={listingTypeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-center text-muted-foreground py-8">No data</p>}
                  </div>

                  {/* User Growth */}
                  <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                    <h3 className="font-semibold mb-4">User Registrations</h3>
                    {userGrowthData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={userGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : <p className="text-center text-muted-foreground py-8">No data</p>}
                  </div>

                  {/* Daily Views */}
                  <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                    <h3 className="font-semibold mb-4">Daily Property Views</h3>
                    {viewsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={viewsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="views" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-center text-muted-foreground py-8">No data</p>}
                  </div>
                </div>
              </div>
            </TabsContent>

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
                            {profile.verified ? (
                              <span className="text-primary text-xs flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Verified</span>
                            ) : (
                              <span className="text-muted-foreground text-xs flex items-center gap-1"><XCircle className="h-3 w-3" /> Unverified</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{format(new Date(profile.created_at), "MMM d, yyyy")}</TableCell>
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
                                    <AlertDialogDescription>{profile.banned ? "This will restore access." : "This will prevent access."}</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  {!profile.banned && (
                                    <div className="space-y-2">
                                      <Label>Reason (optional)</Label>
                                      <Textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Enter ban reason..." />
                                    </div>
                                  )}
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleBanUser(profile)}>{profile.banned ? "Unban" : "Ban"} User</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-amber-600 dark:text-amber-500"><RefreshCw className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reset {profile.name}'s Data?</AlertDialogTitle>
                                    <AlertDialogDescription>This will delete all properties, favorites, and reset verification. Cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleResetUserData(profile)} className="bg-destructive">Reset Data</AlertDialogAction>
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
                          <TableCell className="capitalize">{property.listing_type} • {property.property_type}</TableCell>
                          <TableCell>{format(new Date(property.created_at), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/property/${property.id}`)}><Eye className="h-4 w-4" /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Property?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete this listing.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProperty(property.id)} className="bg-destructive">Delete</AlertDialogAction>
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
                      <TableHeader><TableRow><TableHead>Donor</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {donations.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell><p className="font-medium">{d.donor_name || "Anonymous"}</p><p className="text-sm text-muted-foreground">{d.donor_email}</p></TableCell>
                            <TableCell className="font-semibold">{d.amount} {d.currency}</TableCell>
                            <TableCell>{d.payment_method || "N/A"}</TableCell>
                            <TableCell><Badge variant={d.status === "completed" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                            <TableCell>{format(new Date(d.created_at), "MMM d, yyyy")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No donations recorded yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold mb-4">System Settings</h2>
                <div className="space-y-4">
                  {systemSettings.filter(s => !s.key.startsWith("coming_soon")).map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{setting.key.replace(/_/g, " ")}</p>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch checked={setting.value === "true"} onCheckedChange={() => handleToggleSetting(setting)} />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><LogIn className="h-5 w-5" />Login History</h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Time</TableHead><TableHead>User Agent</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {loginHistory.length > 0 ? loginHistory.slice(0, 20).map((login) => (
                          <TableRow key={login.id}>
                            <TableCell className="font-medium">{login.email}</TableCell>
                            <TableCell>{format(new Date(login.logged_in_at), "MMM d, yyyy h:mm a")}</TableCell>
                            <TableCell className="max-w-xs truncate text-sm">{login.user_agent || "Unknown"}</TableCell>
                          </TableRow>
                        )) : (
                          <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No login history</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="h-5 w-5" />Admin Activity Logs</h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Admin</TableHead><TableHead>Action</TableHead><TableHead>Target</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {activityLogs.length > 0 ? activityLogs.map((log) => {
                          const adminProfile = getProfileByUserId(log.admin_id);
                          return (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">{adminProfile?.name || "Unknown"}</TableCell>
                              <TableCell className="capitalize">{log.action.replace(/_/g, " ")}</TableCell>
                              <TableCell>{log.target_type}: {log.details?.name || log.target_id?.slice(0, 8) || "N/A"}</TableCell>
                              <TableCell>{format(new Date(log.created_at), "MMM d, h:mm a")}</TableCell>
                            </TableRow>
                          );
                        }) : (
                          <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No activity logged</TableCell></TableRow>
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
                    <DialogTrigger asChild><Button className="gap-2 gradient-primary border-0"><UserPlus className="h-4 w-4" />Add Admin</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add New Admin</DialogTitle><DialogDescription>Enter the display name of the user.</DialogDescription></DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2"><Label>User Display Name</Label><Input value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="Enter user's display name" /></div>
                        <Button onClick={handleAddAdmin} disabled={isAddingAdmin || !newAdminEmail} className="w-full gradient-primary border-0">
                          {isAddingAdmin ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : "Add Admin"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Added</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {adminRoles.map((role) => {
                        const profile = getProfileByUserId(role.user_id);
                        return (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium"><div className="flex items-center gap-2">{profile?.name || "Unknown"}{role.user_id === user?.id && <Badge>You</Badge>}</div></TableCell>
                            <TableCell className="capitalize">{role.role}</TableCell>
                            <TableCell>{format(new Date(role.created_at), "MMM d, yyyy")}</TableCell>
                            <TableCell>
                              {role.user_id !== user?.id && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive"><UserX className="h-4 w-4" /></Button></AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Remove Admin Access?</AlertDialogTitle><AlertDialogDescription>This will revoke admin privileges from {profile?.name}.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleRemoveAdmin(role)} className="bg-destructive">Remove Admin</AlertDialogAction></AlertDialogFooter>
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
                <p className="text-muted-foreground text-sm mt-4">Current admin: {user.email}</p>
              </div>
            </TabsContent>

            {/* Messaging Tab */}
            <TabsContent value="messaging">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Send className="h-5 w-5" />Send Message to Users</h2>
                <p className="text-muted-foreground text-sm mb-6">Send notifications and emails to users.</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Select User</Label>
                    <div className="max-h-[400px] overflow-y-auto border rounded-lg">
                      {profiles.map((profile) => (
                        <div key={profile.id} className={`p-3 border-b cursor-pointer transition-colors hover:bg-secondary/50 ${selectedUserForMessage?.id === profile.id ? "bg-primary/10 border-primary" : ""}`} onClick={() => setSelectedUserForMessage(profile)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium flex items-center gap-2">{profile.name}{profile.verified && <BadgeCheck className="h-4 w-4 text-primary" />}</p>
                              <p className="text-sm text-muted-foreground">{profile.phone || "No phone"}</p>
                            </div>
                            {selectedUserForMessage?.id === profile.id && <CheckCircle className="h-5 w-5 text-primary" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {selectedUserForMessage ? (
                      <>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Sending to:</p>
                          <p className="font-semibold">{selectedUserForMessage.name}</p>
                        </div>
                        <div className="space-y-2"><Label>Subject</Label><Input value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} placeholder="e.g., Important Update" /></div>
                        <div className="space-y-2"><Label>Message</Label><Textarea value={messageContent} onChange={(e) => setMessageContent(e.target.value)} placeholder="Write your message..." rows={5} /></div>
                        <div className="flex items-center gap-2"><Switch checked={sendEmailToo} onCheckedChange={setSendEmailToo} /><Label className="cursor-pointer">Also send via email</Label></div>
                        <Button onClick={handleSendMessage} disabled={isSendingMessage || !messageSubject || !messageContent} className="w-full gradient-primary border-0 gap-2">
                          {isSendingMessage ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-4 w-4" />Send Message</>}
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center"><Mail className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Select a user to send a message</p></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Coming Soon Tab */}
            <TabsContent value="comingsoon">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border max-w-2xl">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Rocket className="h-5 w-5" /> Edit Coming Soon Widget
                </h2>
                <p className="text-muted-foreground text-sm mb-6">Edit the content shown in the floating "Coming Soon" widget on the bottom-left of every page.</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={comingSoonTitle} onChange={(e) => setComingSoonTitle(e.target.value)} placeholder="Coming Soon" />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea value={comingSoonMessage} onChange={(e) => setComingSoonMessage(e.target.value)} placeholder="Description text..." rows={3} />
                  </div>

                  {/* Preview */}
                  <div className="border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <div className="bg-card border border-border rounded-xl shadow-lg p-4 max-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                          <Rocket className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-sm">{comingSoonTitle}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{comingSoonMessage}</p>
                    </div>
                  </div>

                  <Button onClick={handleSaveComingSoon} disabled={isSavingComingSoon} className="gradient-primary border-0 gap-2">
                    {isSavingComingSoon ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                  </Button>
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
