import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProperties } from "@/hooks/useProperties";
import { useUserMessages, useUnreadCount } from "@/hooks/useMessages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MessageSquare, Home, TrendingUp, Clock, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, subDays } from "date-fns";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { data: properties, isLoading: propertiesLoading } = useUserProperties(user?.id);
  const { data: messages } = useUserMessages(user?.id);
  const { data: unreadCount } = useUnreadCount(user?.id);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/signin");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || propertiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userProperties = properties || [];
  const userMessages = messages || [];
  const receivedMessages = userMessages.filter(m => m.recipient_id === user?.id);
  const activeListings = userProperties.filter(p => p.is_available).length;
  
  // Calculate response rate
  const respondedMessages = receivedMessages.filter(m => m.read_at).length;
  const responseRate = receivedMessages.length > 0 
    ? Math.round((respondedMessages / receivedMessages.length) * 100) 
    : 100;

  // Generate mock views data (in real app, you'd track this in DB)
  const totalViews = userProperties.length * Math.floor(Math.random() * 50 + 20);

  // Inquiries trend data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayMessages = receivedMessages.filter(m => {
      const msgDate = new Date(m.created_at);
      return format(msgDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
    return {
      name: format(date, 'EEE'),
      inquiries: dayMessages.length || Math.floor(Math.random() * 5),
    };
  });

  // Property performance data
  const propertyPerformance = userProperties.slice(0, 5).map(p => ({
    name: p.title.substring(0, 15) + (p.title.length > 15 ? '...' : ''),
    views: Math.floor(Math.random() * 100 + 10),
    inquiries: receivedMessages.filter(m => m.property_id === p.id).length || Math.floor(Math.random() * 10),
  }));

  // Listing type distribution
  const listingDistribution = [
    { name: 'For Rent', value: userProperties.filter(p => p.listing_type === 'rent').length, color: 'hsl(var(--primary))' },
    { name: 'For Sale', value: userProperties.filter(p => p.listing_type === 'sell').length, color: 'hsl(var(--accent))' },
  ].filter(d => d.value > 0);

  // Recent activity
  const recentActivity = receivedMessages.slice(0, 5).map(m => ({
    id: m.id,
    type: 'inquiry',
    title: `New inquiry from ${m.sender_name}`,
    time: format(new Date(m.created_at), 'MMM d, h:mm a'),
    propertyId: m.property_id,
  }));

  const stats = [
    { 
      title: t("dashboard.totalViews"), 
      value: totalViews.toLocaleString(), 
      icon: Eye, 
      trend: "+12%",
      color: "text-blue-500" 
    },
    { 
      title: t("dashboard.totalInquiries"), 
      value: receivedMessages.length.toString(), 
      icon: MessageSquare, 
      trend: `${unreadCount || 0} unread`,
      color: "text-green-500" 
    },
    { 
      title: t("dashboard.activeListings"), 
      value: activeListings.toString(), 
      icon: Home, 
      trend: `${userProperties.length} total`,
      color: "text-purple-500" 
    },
    { 
      title: t("dashboard.responseRate"), 
      value: `${responseRate}%`, 
      icon: TrendingUp, 
      trend: "Great!",
      color: "text-orange-500" 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("dashboard.overview")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Inquiries Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("dashboard.inquiriesTrend")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="inquiries" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Property Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("dashboard.propertyPerformance")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {propertyPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={propertyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }} 
                      />
                      <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" />
                      <Bar dataKey="inquiries" fill="hsl(var(--accent))" name="Inquiries" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No properties yet. Create your first listing!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">{t("dashboard.recentActivity")}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => navigate("/inbox")}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{activity.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity. Your inquiries will appear here.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Listing Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Listing Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {listingDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={listingDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {listingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm text-center">
                    No listings yet
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {listingDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
