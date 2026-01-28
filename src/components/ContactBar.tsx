import { Send, Phone, Mail } from "lucide-react";

const contacts = [
  { 
    icon: Send, 
    label: "Telegram", 
    href: "https://t.me/Delux_et", 
    display: "@Delux_et" 
  },
  { 
    icon: Send, 
    label: "Channel", 
    href: "https://t.me/Delux_et1", 
    display: "Channel" 
  },
  { 
    icon: () => (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ), 
    label: "TikTok", 
    href: "https://www.tiktok.com/@delux_et", 
    display: "@delux_et" 
  },
  { 
    icon: Phone, 
    label: "Phone", 
    href: "tel:+251902342307", 
    display: "+251 90 234 2307" 
  },
  { 
    icon: Mail, 
    label: "Email", 
    href: "mailto:Deluxethiopia@gmail.com", 
    display: "Deluxethiopia@gmail.com" 
  },
];

export function ContactBar() {
  return (
    <div className="w-full bg-primary text-primary-foreground py-1.5">
      <div className="container">
        <div className="flex items-center justify-center gap-4 md:gap-6 text-xs overflow-x-auto scrollbar-hide">
          {contacts.map((contact) => (
            <a
              key={contact.label}
              href={contact.href}
              target={contact.href.startsWith("http") ? "_blank" : undefined}
              rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              <contact.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{contact.display}</span>
              <span className="sm:hidden">{contact.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
