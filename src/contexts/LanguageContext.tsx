import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "am";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.search": "Search",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.signin": "Sign In",
    "nav.signup": "Sign Up",
    "nav.profile": "My Profile",
    "nav.favorites": "Favorites",
    "nav.messages": "Messages",
    "nav.dashboard": "Dashboard",
    "nav.admin": "Admin Panel",
    "nav.logout": "Log Out",
    "nav.createListing": "Create Listing",
    
    // Hero
    "hero.title": "Find Your Perfect Home",
    "hero.subtitle": "Get Your Home with Free",
    "hero.description": "Delux connects homeowners and renters directly — no agents, no fees, no hassle.",
    "hero.searchPlaceholder": "Search by location, property type...",
    "hero.search": "Search",
    
    // Property
    "property.bedrooms": "Bedrooms",
    "property.bathrooms": "Bathrooms",
    "property.area": "Area",
    "property.forRent": "For Rent",
    "property.forSale": "For Sale",
    "property.furnished": "Furnished",
    "property.unfurnished": "Unfurnished",
    "property.available": "Available",
    "property.unavailable": "Unavailable",
    "property.contactOwner": "Contact Owner",
    "property.compare": "Compare",
    "property.addToCompare": "Add to Compare",
    "property.removeFromCompare": "Remove from Compare",
    
    // Auth
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Full Name",
    "auth.phone": "Phone Number",
    "auth.forgotPassword": "Forgot Password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.orContinueWith": "Or continue with",
    
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.overview": "Overview",
    "dashboard.totalViews": "Total Views",
    "dashboard.totalInquiries": "Total Inquiries",
    "dashboard.activeListings": "Active Listings",
    "dashboard.responseRate": "Response Rate",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.propertyPerformance": "Property Performance",
    "dashboard.inquiriesTrend": "Inquiries Trend",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.submit": "Submit",
    "common.back": "Back",
    "common.next": "Next",
    "common.all": "All",
    "common.verified": "Verified",
    
    // Footer
    "footer.tagline": "Delux — a free housing connection platform. It's connection. Delux connects people, not payments.",
    "footer.company": "Company",
    "footer.support": "Support",
    "footer.listings": "Listings",
    "footer.aboutUs": "About Us",
    "footer.howItWorks": "How It Works",
    "footer.careers": "Careers",
    "footer.press": "Press",
    "footer.helpCenter": "Help Center",
    "footer.safety": "Safety",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.browseHomes": "Browse Homes",
    "footer.listProperty": "List Property",
    "footer.popularAreas": "Popular Areas",
    "footer.rights": "All rights reserved.",
    "footer.madeWith": "Made with ❤️ in Ethiopia",
    
    // Reviews
    "reviews.title": "Reviews",
    "reviews.writeReview": "Write a Review",
    "reviews.rating": "Rating",
    "reviews.comment": "Your Review",
    "reviews.submit": "Submit Review",
    "reviews.noReviews": "No reviews yet",
    
    // Notifications
    "notifications.title": "Notifications",
    "notifications.markAllRead": "Mark all as read",
    "notifications.noNotifications": "No notifications",
    
    // Contact
    "contact.telegram": "Telegram",
    "contact.tiktok": "TikTok",
    "contact.phone": "Phone",
    "contact.email": "Email",
  },
  am: {
    // Navigation
    "nav.home": "መነሻ",
    "nav.search": "ፈልግ",
    "nav.about": "ስለ እኛ",
    "nav.contact": "አግኙን",
    "nav.signin": "ግባ",
    "nav.signup": "ተመዝገብ",
    "nav.profile": "መገለጫዬ",
    "nav.favorites": "ምርጫዎች",
    "nav.messages": "መልዕክቶች",
    "nav.dashboard": "ዳሽቦርድ",
    "nav.admin": "አስተዳዳሪ ፓነል",
    "nav.logout": "ውጣ",
    "nav.createListing": "ዝርዝር ፍጠር",
    
    // Hero
    "hero.title": "ፍጹም ቤትዎን ያግኙ",
    "hero.subtitle": "ቤትዎን በነጻ ያግኙ",
    "hero.description": "ዴሉክስ የቤት ባለቤቶችን እና ተከራዮችን በቀጥታ ያገናኛል — ደላላ የለም፣ ክፍያ የለም፣ ችግር የለም።",
    "hero.searchPlaceholder": "በአካባቢ፣ በንብረት ዓይነት ፈልግ...",
    "hero.search": "ፈልግ",
    
    // Property
    "property.bedrooms": "መኝታ ክፍሎች",
    "property.bathrooms": "መታጠቢያ ክፍሎች",
    "property.area": "አካባቢ",
    "property.forRent": "ለኪራይ",
    "property.forSale": "ለሽያጭ",
    "property.furnished": "የተደራጀ",
    "property.unfurnished": "ያልተደራጀ",
    "property.available": "ይገኛል",
    "property.unavailable": "አይገኝም",
    "property.contactOwner": "ባለቤቱን አግኙ",
    "property.compare": "አወዳድር",
    "property.addToCompare": "ለንጽጽር ጨምር",
    "property.removeFromCompare": "ከንጽጽር አውጣ",
    
    // Auth
    "auth.signIn": "ግባ",
    "auth.signUp": "ተመዝገብ",
    "auth.email": "ኢሜይል",
    "auth.password": "የይለፍ ቃል",
    "auth.name": "ሙሉ ስም",
    "auth.phone": "ስልክ ቁጥር",
    "auth.forgotPassword": "የይለፍ ቃል ረሳኽ?",
    "auth.noAccount": "መለያ የለህም?",
    "auth.hasAccount": "መለያ አለህ?",
    "auth.orContinueWith": "ወይም ቀጥል በ",
    
    // Dashboard
    "dashboard.title": "ዳሽቦርድ",
    "dashboard.overview": "አጠቃላይ እይታ",
    "dashboard.totalViews": "ጠቅላላ እይታዎች",
    "dashboard.totalInquiries": "ጠቅላላ ጥያቄዎች",
    "dashboard.activeListings": "ንቁ ዝርዝሮች",
    "dashboard.responseRate": "የምላሽ መጠን",
    "dashboard.recentActivity": "የቅርብ ጊዜ እንቅስቃሴ",
    "dashboard.propertyPerformance": "የንብረት አፈጻጸም",
    "dashboard.inquiriesTrend": "የጥያቄዎች አዝማሚያ",
    
    // Common
    "common.loading": "በመጫን ላይ...",
    "common.error": "የሆነ ነገር ተሳስቷል",
    "common.save": "አስቀምጥ",
    "common.cancel": "ሰርዝ",
    "common.delete": "ሰርዝ",
    "common.edit": "አርትዕ",
    "common.view": "ተመልከት",
    "common.submit": "አስገባ",
    "common.back": "ተመለስ",
    "common.next": "ቀጣይ",
    "common.all": "ሁሉም",
    "common.verified": "የተረጋገጠ",
    
    // Footer
    "footer.tagline": "ዴሉክስ — ነጻ የቤት ማገናኛ መድረክ። ግንኙነት ነው። ዴሉክስ ሰዎችን ያገናኛል፣ ክፍያ አይደለም።",
    "footer.company": "ኩባንያ",
    "footer.support": "ድጋፍ",
    "footer.listings": "ዝርዝሮች",
    "footer.aboutUs": "ስለ እኛ",
    "footer.howItWorks": "እንዴት እንደሚሰራ",
    "footer.careers": "ስራዎች",
    "footer.press": "ፕሬስ",
    "footer.helpCenter": "የእገዛ ማዕከል",
    "footer.safety": "ደህንነት",
    "footer.terms": "የአገልግሎት ውል",
    "footer.privacy": "የግላዊነት ፖሊሲ",
    "footer.browseHomes": "ቤቶችን ይመልከቱ",
    "footer.listProperty": "ንብረት ይመዝገቡ",
    "footer.popularAreas": "ታዋቂ አካባቢዎች",
    "footer.rights": "መብቱ በህግ የተጠበቀ ነው።",
    "footer.madeWith": "በኢትዮጵያ ❤️ ተሰርቷል",
    
    // Reviews
    "reviews.title": "ግምገማዎች",
    "reviews.writeReview": "ግምገማ ጻፍ",
    "reviews.rating": "ደረጃ",
    "reviews.comment": "ግምገማዎ",
    "reviews.submit": "ግምገማ አስገባ",
    "reviews.noReviews": "ገና ግምገማ የለም",
    
    // Notifications
    "notifications.title": "ማሳወቂያዎች",
    "notifications.markAllRead": "ሁሉንም እንደተነበበ ምልክት አድርግ",
    "notifications.noNotifications": "ማሳወቂያ የለም",
    
    // Contact
    "contact.telegram": "ቴሌግራም",
    "contact.tiktok": "ቲክቶክ",
    "contact.phone": "ስልክ",
    "contact.email": "ኢሜይል",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("delux-language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("delux-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
