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
    "nav.support": "Support",
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
    "property.viewDetails": "View Details",
    "property.contact": "Contact",
    "property.description": "Description",
    "property.features": "Features",
    "property.postedBy": "Posted by",
    "property.viewPhone": "View Phone Number",
    "property.save": "Save",
    "property.saved": "Saved",
    "property.price": "Price",
    "property.pricePerMonth": "/month",
    "property.free": "Free",
    "property.negotiable": "Negotiable",
    
    // Search Page
    "search.title": "Find Your",
    "search.titleHighlight": "Perfect Home",
    "search.propertiesAvailable": "properties available",
    "search.filters": "Filters",
    "search.propertyType": "Property Type",
    "search.allTypes": "All Types",
    "search.listingType": "Listing Type",
    "search.all": "All",
    "search.location": "Location",
    "search.allLocations": "All Locations",
    "search.bedrooms": "Bedrooms",
    "search.any": "Any",
    "search.priceRange": "Price Range (ETB)",
    "search.furnishedOnly": "Furnished Only",
    "search.amenities": "Amenities",
    "search.search": "Search",
    "search.clearFilters": "Clear all filters",
    "search.noProperties": "No properties found",
    "search.noPropertiesDesc": "Try adjusting your filters to see more results",
    "search.grid": "Grid",
    "search.map": "Map",
    
    // Listing Form
    "listing.title": "List Your Home with Delux",
    "listing.subtitle": "Free. Simple. Trusted in Ethiopia.",
    "listing.whatToDo": "What would you like to do?",
    "listing.forRent": "For Rent",
    "listing.rentDesc": "Rent your home",
    "listing.forSell": "For Sell",
    "listing.sellDesc": "Sell your property",
    "listing.propertyType": "Property Type",
    "listing.chooseLocation": "Choose Property Location",
    "listing.city": "City",
    "listing.selectCity": "Select city",
    "listing.area": "Area",
    "listing.selectArea": "Select area",
    "listing.details": "Property Details",
    "listing.titleOptional": "Title (optional)",
    "listing.titlePlaceholder": "e.g., Modern Family Home",
    "listing.bedrooms": "Bedrooms",
    "listing.bathrooms": "Bathrooms",
    "listing.furnishing": "Furnishing",
    "listing.furnished": "Furnished",
    "listing.unfurnished": "Unfurnished",
    "listing.description": "Description",
    "listing.descPlaceholder": "Describe your property...",
    "listing.addPhotos": "Add Photos",
    "listing.dragDrop": "Drag & drop images or click to browse",
    "listing.maxImages": "Maximum 5 images, 5MB each",
    "listing.price": "Price (ETB)",
    "listing.pricePlaceholder": "e.g., 15000",
    "listing.priceOptional": "Price (optional)",
    "listing.next": "Next",
    "listing.back": "Back",
    "listing.submit": "Submit Listing",
    "listing.submitting": "Creating Listing...",
    "listing.success": "Listing Created!",
    "listing.successDesc": "Your property has been listed successfully.",
    "listing.signInRequired": "Sign In Required",
    "listing.signInDesc": "Please sign in to list your property.",
    "listing.verificationRequired": "Verification Required",
    "listing.verificationDesc": "To protect our community, you need to verify your account before posting property listings.",
    "listing.verifyAccount": "Verify Account",
    
    // Property Details
    "details.back": "Back",
    "details.notFound": "Property Not Found",
    "details.notFoundDesc": "The property you're looking for doesn't exist.",
    "details.backToHome": "Back to Home",
    "details.phoneNumber": "Phone Number",
    "details.signInToContact": "Sign in to contact the owner",
    
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
    "dashboard.listingDistribution": "Listing Distribution",
    "dashboard.noActivity": "No recent activity. Your inquiries will appear here.",
    "dashboard.noProperties": "No properties yet. Create your first listing!",
    "dashboard.noListings": "No listings yet",
    
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
    "common.goHome": "Go Home",
    
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
    "nav.support": "ድጋፍ",
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
    "property.viewDetails": "ዝርዝሮችን ተመልከት",
    "property.contact": "አግኙ",
    "property.description": "መግለጫ",
    "property.features": "ባህሪያት",
    "property.postedBy": "የለጠፈው",
    "property.viewPhone": "ስልክ ቁጥር ተመልከት",
    "property.save": "አስቀምጥ",
    "property.saved": "ተቀምጧል",
    "property.price": "ዋጋ",
    "property.pricePerMonth": "/በወር",
    "property.free": "ነጻ",
    "property.negotiable": "የሚደራደር",
    
    // Search Page
    "search.title": "ፍጹም",
    "search.titleHighlight": "ቤትዎን ያግኙ",
    "search.propertiesAvailable": "ንብረቶች ይገኛሉ",
    "search.filters": "ማጣሪያዎች",
    "search.propertyType": "የንብረት ዓይነት",
    "search.allTypes": "ሁሉም ዓይነቶች",
    "search.listingType": "የዝርዝር ዓይነት",
    "search.all": "ሁሉም",
    "search.location": "አካባቢ",
    "search.allLocations": "ሁሉም አካባቢዎች",
    "search.bedrooms": "መኝታ ክፍሎች",
    "search.any": "ማንኛውም",
    "search.priceRange": "የዋጋ ክልል (ብር)",
    "search.furnishedOnly": "የተደራጁ ብቻ",
    "search.amenities": "አገልግሎቶች",
    "search.search": "ፈልግ",
    "search.clearFilters": "ሁሉንም ማጣሪያዎች አጽዳ",
    "search.noProperties": "ምንም ንብረት አልተገኘም",
    "search.noPropertiesDesc": "ተጨማሪ ውጤቶችን ለማየት ማጣሪያዎችዎን ያስተካክሉ",
    "search.grid": "ፍርግርግ",
    "search.map": "ካርታ",
    
    // Listing Form
    "listing.title": "ቤትዎን ከዴሉክስ ጋር ይዘርዝሩ",
    "listing.subtitle": "ነጻ። ቀላል። በኢትዮጵያ የታመነ።",
    "listing.whatToDo": "ምን ማድረግ ይፈልጋሉ?",
    "listing.forRent": "ለኪራይ",
    "listing.rentDesc": "ቤትዎን ያከራዩ",
    "listing.forSell": "ለሽያጭ",
    "listing.sellDesc": "ንብረትዎን ይሽጡ",
    "listing.propertyType": "የንብረት ዓይነት",
    "listing.chooseLocation": "የንብረት አካባቢ ይምረጡ",
    "listing.city": "ከተማ",
    "listing.selectCity": "ከተማ ይምረጡ",
    "listing.area": "አካባቢ",
    "listing.selectArea": "አካባቢ ይምረጡ",
    "listing.details": "የንብረት ዝርዝሮች",
    "listing.titleOptional": "ርዕስ (አማራጭ)",
    "listing.titlePlaceholder": "ለምሳሌ: ዘመናዊ የቤተሰብ ቤት",
    "listing.bedrooms": "መኝታ ክፍሎች",
    "listing.bathrooms": "መታጠቢያ ክፍሎች",
    "listing.furnishing": "ዕቃዎች",
    "listing.furnished": "የተደራጀ",
    "listing.unfurnished": "ያልተደራጀ",
    "listing.description": "መግለጫ",
    "listing.descPlaceholder": "ንብረትዎን ይግለጹ...",
    "listing.addPhotos": "ፎቶዎችን ያክሉ",
    "listing.dragDrop": "ምስሎችን ይጎትቱ እና ይጣሉ ወይም ለማሰስ ይጫኑ",
    "listing.maxImages": "ከፍተኛ 5 ምስሎች፣ እያንዳንዳቸው 5MB",
    "listing.price": "ዋጋ (ብር)",
    "listing.pricePlaceholder": "ለምሳሌ: 15000",
    "listing.priceOptional": "ዋጋ (አማራጭ)",
    "listing.next": "ቀጣይ",
    "listing.back": "ተመለስ",
    "listing.submit": "ዝርዝር አስገባ",
    "listing.submitting": "ዝርዝር በመፍጠር ላይ...",
    "listing.success": "ዝርዝር ተፈጥሯል!",
    "listing.successDesc": "ንብረትዎ በተሳካ ሁኔታ ተዘርዝሯል።",
    "listing.signInRequired": "መግባት ያስፈልጋል",
    "listing.signInDesc": "ንብረትዎን ለመዘርዘር እባክዎ ይግቡ።",
    "listing.verificationRequired": "ማረጋገጫ ያስፈልጋል",
    "listing.verificationDesc": "ማህበረሰባችንን ለመጠበቅ ንብረት ዝርዝሮችን ከመለጠፍዎ በፊት መለያዎን ማረጋገጥ ያስፈልግዎታል።",
    "listing.verifyAccount": "መለያ አረጋግጥ",
    
    // Property Details
    "details.back": "ተመለስ",
    "details.notFound": "ንብረት አልተገኘም",
    "details.notFoundDesc": "የሚፈልጉት ንብረት የለም።",
    "details.backToHome": "ወደ መነሻ ተመለስ",
    "details.phoneNumber": "ስልክ ቁጥር",
    "details.signInToContact": "ባለቤቱን ለማግኘት ይግቡ",
    
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
    "dashboard.listingDistribution": "የዝርዝር ስርጭት",
    "dashboard.noActivity": "የቅርብ ጊዜ እንቅስቃሴ የለም። ጥያቄዎችዎ እዚህ ይታያሉ።",
    "dashboard.noProperties": "ገና ንብረቶች የሉም። የመጀመሪያውን ዝርዝርዎን ይፍጠሩ!",
    "dashboard.noListings": "ገና ዝርዝሮች የሉም",
    
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
    "common.goHome": "ወደ መነሻ ሂድ",
    
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
