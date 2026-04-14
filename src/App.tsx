import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CompareBar } from "@/components/CompareBar";

import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PropertyDetails from "./pages/PropertyDetails";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import ListProperty from "./pages/ListProperty";
import About from "./pages/About";
import Search from "./pages/Search";
import Inbox from "./pages/Inbox";
import VerifyAccount from "./pages/VerifyAccount";
import Admin from "./pages/Admin";
import Compare from "./pages/Compare";
import Dashboard from "./pages/Dashboard";
import Support from "./pages/Support";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Referral from "./pages/Referral";
import NotFound from "./pages/NotFound";
import { BuyMeCoffeeWidget } from "@/components/BuyMeCoffeeWidget";
import { InviteWidget } from "@/components/InviteWidget";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - avoid refetching fresh data
      gcTime: 10 * 60 * 1000, // 10 minutes - keep cache longer
      refetchOnWindowFocus: false, // don't refetch on tab switch
      retry: 1, // only retry once on failure
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="delux-ui-theme">
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <FavoritesProvider>
                <CompareProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/property/:id" element={<PropertyDetails />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/list-property" element={<ListProperty />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/inbox" element={<Inbox />} />
                    <Route path="/verify" element={<VerifyAccount />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/referral" element={<Referral />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <CompareBar />
                  <BuyMeCoffeeWidget />
                  <InviteWidget />
                </CompareProvider>
              </FavoritesProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
