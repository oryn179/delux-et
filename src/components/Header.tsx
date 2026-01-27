import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, Heart, LogOut, Search, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUnreadCount } from "@/hooks/useMessages";
import { useIsAdmin } from "@/hooks/useAdmin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import deluxLogo from "@/assets/delux-logo.png";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Search", href: "/search" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/#contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: unreadCount } = useUnreadCount(user?.id);
  const { data: isAdmin } = useIsAdmin(user?.id);
  const navigate = useNavigate();

  const displayName = profile?.name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={deluxLogo} alt="Delux" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/favorites")}
                className="rounded-full"
              >
                <Heart className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {initial}
                    </div>
                    {displayName.split(" ")[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/inbox")}>
                    <Mail className="h-4 w-4 mr-2" />
                    Messages
                    {unreadCount && unreadCount > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2">
                        {unreadCount}
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/favorites")}>
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button size="sm" className="gradient-primary border-0" onClick={() => navigate("/list-property")}>
                Create Listing
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/signin")}>
                <User className="h-4 w-4" />
                Sign In
              </Button>
              <Button size="sm" className="gradient-primary border-0" onClick={() => navigate("/list-property")}>
                Create Listing
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 space-y-2 border-t border-border">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      navigate("/profile");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      navigate("/favorites");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Heart className="h-4 w-4" />
                    Favorites
                  </Button>
                  <Button
                    className="w-full gradient-primary border-0"
                    onClick={() => {
                      navigate("/list-property");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Create Listing
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-destructive"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      navigate("/signin");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4" />
                    Sign In
                  </Button>
                  <Button
                    className="w-full gradient-primary border-0"
                    onClick={() => {
                      navigate("/list-property");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Create Listing
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
