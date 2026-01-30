import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, Send, MapPin } from "lucide-react";

const contactMethods = [
  {
    icon: Phone,
    label: "Phone",
    value: "+251 91 234 5678",
    href: "tel:+251912345678",
    description: "Call us directly for immediate assistance",
  },
  {
    icon: Mail,
    label: "Email",
    value: "deluxethiopia@gmail.com",
    href: "mailto:deluxethiopia@gmail.com",
    description: "Send us an email anytime",
  },
  {
    icon: Send,
    label: "Telegram Contact",
    value: "@Delux_ET",
    href: "https://t.me/Delux_ET",
    description: "Message us on Telegram",
  },
  {
    icon: Send,
    label: "Telegram Channel",
    value: "@Delux_ET1",
    href: "https://t.me/Delux_ET1",
    description: "Join our Telegram channel for updates",
  },
];

const socialLinks = [
  {
    icon: () => (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ),
    label: "TikTok",
    value: "@Delux_ET",
    href: "https://tiktok.com/@Delux_ET",
  },
  {
    icon: () => (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    label: "Instagram",
    value: "@delux_et",
    href: "https://instagram.com/delux_et",
  },
];

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 gradient-hero py-12">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions or need assistance? We're here to help! Reach out to us through any of the channels below.
            </p>
          </div>

          {/* Location */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-card px-6 py-3 rounded-full border border-border">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">Addis Ababa, Ethiopia</span>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {contactMethods.map((method) => (
              <Card key={method.label} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                    <method.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{method.label}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <a
                    href={method.href}
                    target={method.href.startsWith("http") ? "_blank" : undefined}
                    rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-primary hover:underline font-medium text-lg"
                  >
                    {method.value}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Social Links */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-6">Follow Us on Social Media</h2>
            <div className="flex justify-center gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <social.icon />
                  </div>
                  <span className="font-medium">{social.label}</span>
                  <span className="text-sm text-muted-foreground">{social.value}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
