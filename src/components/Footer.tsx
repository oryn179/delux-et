import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, Phone, MapPin, Send } from "lucide-react";
import deluxLogo from "@/assets/delux-logo.png";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Support Us", href: "/support" },
  ],
  support: [
    { name: "Help Center", href: "/contact" },
    { name: "Safety", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ],
  listings: [
    { name: "Browse Homes", href: "/search" },
    { name: "List Property", href: "/list-property" },
    { name: "Favorites", href: "/favorites" },
  ],
};

const TikTokIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const socialLinks = [
  { icon: Send, href: "https://t.me/Delux_ET", label: "Telegram" },
  { icon: Instagram, href: "https://instagram.com/delux_et", label: "Instagram" },
  { icon: TikTokIcon, href: "https://tiktok.com/@Delux_ET", label: "TikTok" },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-secondary/50 border-t border-border">
      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img src={deluxLogo} alt="Delux" className="h-10 w-auto" />
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              Delux — a free housing connection platform. It's connection.
              Delux connects people, not payments.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+251912345678" className="hover:text-primary transition-colors">+251 91 234 5678</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:deluxethiopia@gmail.com" className="hover:text-primary transition-colors">deluxethiopia@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                <a href="https://t.me/Delux_ET" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">t.me/Delux_ET</a>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Listings</h4>
            <ul className="space-y-2">
              {footerLinks.listings.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Delux. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ in Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}
