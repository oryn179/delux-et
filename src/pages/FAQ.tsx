import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Search, Home, Shield, Users, CreditCard, Phone } from "lucide-react";

const faqCategories = [
  {
    icon: Home,
    title: "Getting Started",
    titleAm: "መጀመር",
    questions: [
      {
        q: "What is Delux?",
        qAm: "ዴሉክስ ምንድን ነው?",
        a: "Delux is a free housing connection platform in Ethiopia that connects homeowners directly with renters and buyers — no agents, no fees, no hassle.",
        aAm: "ዴሉክስ በኢትዮጵያ ውስጥ የቤት ባለቤቶችን ከተከራዮች እና ገዢዎች ጋር በቀጥታ የሚያገናኝ ነጻ የቤት ማገናኛ መድረክ ነው — ደላላ የለም፣ ክፍያ የለም፣ ችግር የለም።",
      },
      {
        q: "Is Delux really free?",
        qAm: "ዴሉክስ በእውነት ነጻ ነው?",
        a: "Yes! Delux is completely free for both property owners and renters/buyers. We connect people directly without any hidden fees or commissions.",
        aAm: "አዎ! ዴሉክስ ለንብረት ባለቤቶችም ሆነ ለተከራዮች/ገዢዎች ሙሉ በሙሉ ነጻ ነው። ምንም የተደበቀ ክፍያ ወይም ኮሚሽን ሳይኖር ሰዎችን በቀጥታ እናገናኛለን።",
      },
      {
        q: "How do I create an account?",
        qAm: "መለያ እንዴት መፍጠር እችላለሁ?",
        a: "Click on 'Sign Up' in the top navigation, enter your name, email, and phone number, then verify your account via SMS to start using Delux.",
        aAm: "በላይኛው ማሰሻ ላይ 'ተመዝገብ' ን ጠቅ ያድርጉ፣ ስምዎን፣ ኢሜይልዎን እና ስልክ ቁጥርዎን ያስገቡ፣ ከዚያ ዴሉክስ መጠቀም ለመጀመር መለያዎን በኤስኤምኤስ ያረጋግጡ።",
      },
    ],
  },
  {
    icon: Search,
    title: "Searching Properties",
    titleAm: "ንብረቶችን መፈለግ",
    questions: [
      {
        q: "How do I search for properties?",
        qAm: "ንብረቶችን እንዴት መፈለግ እችላለሁ?",
        a: "Use the search bar on the homepage or go to the Search page. You can filter by location, property type, price range, number of bedrooms, and more.",
        aAm: "በመነሻ ገጹ ላይ ያለውን የፍለጋ አሞሌ ይጠቀሙ ወይም ወደ ፍለጋ ገጽ ይሂዱ። በአካባቢ፣ በንብረት ዓይነት፣ በዋጋ ክልል፣ በመኝታ ክፍሎች ቁጥር እና ተጨማሪ ማጣራት ይችላሉ።",
      },
      {
        q: "Can I save properties I like?",
        qAm: "የምወዳቸውን ንብረቶች ማስቀመጥ እችላለሁ?",
        a: "Yes! Click the heart icon on any property card to save it to your Favorites. You need to be signed in to use this feature.",
        aAm: "አዎ! ወደ ምርጫዎችዎ ለማስቀመጥ በማንኛውም የንብረት ካርድ ላይ የልብ አዶውን ጠቅ ያድርጉ። ይህንን ባህሪ ለመጠቀም መግባት ያስፈልግዎታል።",
      },
      {
        q: "How do I compare properties?",
        qAm: "ንብረቶችን እንዴት ማወዳደር እችላለሁ?",
        a: "Click the 'Add to Compare' button on property cards. You can compare up to 4 properties side by side to see their features, prices, and details.",
        aAm: "በንብረት ካርዶች ላይ 'ለንጽጽር ጨምር' የሚለውን ቁልፍ ጠቅ ያድርጉ። ባህሪያቸውን፣ ዋጋዎቻቸውን እና ዝርዝሮቻቸውን ለማየት እስከ 4 ንብረቶችን ጎን ለጎን ማወዳደር ይችላሉ።",
      },
    ],
  },
  {
    icon: Users,
    title: "Listing Properties",
    titleAm: "ንብረቶችን መዘርዘር",
    questions: [
      {
        q: "How do I list my property?",
        qAm: "ንብረቴን እንዴት መዘርዘር እችላለሁ?",
        a: "Click 'Create Listing' in the navigation, choose whether you're renting or selling, fill in the property details, add photos, and submit. Your listing will be live instantly!",
        aAm: "በማሰሻው ውስጥ 'ዝርዝር ፍጠር' ን ጠቅ ያድርጉ፣ እያከራዩ ወይም እየሸጡ መሆንዎን ይምረጡ፣ የንብረቱን ዝርዝሮች ይሙሉ፣ ፎቶዎችን ያክሉ እና ያስገቡ። ዝርዝርዎ ወዲያውኑ ይሰራል!",
      },
      {
        q: "Do I need to verify my account to list?",
        qAm: "ለመዘርዘር መለያዬን ማረጋገጥ ያስፈልገኛል?",
        a: "Yes, you need to verify your phone number before you can list properties. This helps protect our community from fake listings.",
        aAm: "አዎ፣ ንብረቶችን ከመዘርዘርዎ በፊት ስልክ ቁጥርዎን ማረጋገጥ ያስፈልግዎታል። ይህ ማህበረሰባችንን ከሐሰት ዝርዝሮች ለመጠበቅ ይረዳል።",
      },
      {
        q: "How many photos can I upload?",
        qAm: "ስንት ፎቶዎች መጫን እችላለሁ?",
        a: "You can upload up to 5 photos per listing. Each photo should be no larger than 5MB. We recommend using high-quality images to attract more interest.",
        aAm: "በእያንዳንዱ ዝርዝር እስከ 5 ፎቶዎች መጫን ይችላሉ። እያንዳንዱ ፎቶ ከ5MB መብለጥ የለበትም። የበለጠ ፍላጎት ለመሳብ ከፍተኛ ጥራት ያላቸውን ምስሎች እንዲጠቀሙ እንመክራለን።",
      },
    ],
  },
  {
    icon: Phone,
    title: "Contacting Owners",
    titleAm: "ባለቤቶችን ማግኘት",
    questions: [
      {
        q: "How do I contact a property owner?",
        qAm: "የንብረት ባለቤትን እንዴት ማግኘት እችላለሁ?",
        a: "On any property listing, click 'Contact Owner' to send them a message. You can also view their phone number directly on the listing page.",
        aAm: "በማንኛውም የንብረት ዝርዝር ላይ መልዕክት ለመላክ 'ባለቤቱን አግኙ' ን ጠቅ ያድርጉ። እንዲሁም ስልክ ቁጥራቸውን በቀጥታ በዝርዝር ገጹ ላይ ማየት ይችላሉ።",
      },
      {
        q: "Where can I see my messages?",
        qAm: "መልዕክቶቼን የት ማየት እችላለሁ?",
        a: "Click on your profile menu and select 'Messages' to see all your conversations with property owners and potential renters/buyers.",
        aAm: "ከንብረት ባለቤቶች እና ሊሆኑ ከሚችሉ ተከራዮች/ገዢዎች ጋር ያሉ ሁሉንም ውይይቶችዎን ለማየት የመገለጫ ምናሌዎን ጠቅ ያድርጉ እና 'መልዕክቶች' ን ይምረጡ።",
      },
    ],
  },
  {
    icon: Shield,
    title: "Safety & Trust",
    titleAm: "ደህንነት እና እምነት",
    questions: [
      {
        q: "How does Delux verify users?",
        qAm: "ዴሉክስ ተጠቃሚዎችን እንዴት ያረጋግጣል?",
        a: "Users verify their accounts through SMS verification with their phone number. Verified users display a badge on their profile, indicating they're trusted members.",
        aAm: "ተጠቃሚዎች መለያዎቻቸውን በስልክ ቁጥራቸው በኤስኤምኤስ ማረጋገጫ ያረጋግጣሉ። የተረጋገጡ ተጠቃሚዎች በመገለጫቸው ላይ ምልክት ያሳያሉ፣ ይህም የታመኑ አባላት መሆናቸውን ያሳያል።",
      },
      {
        q: "How do I report a suspicious listing?",
        qAm: "አጠራጣሪ ዝርዝር እንዴት ማሳወቅ እችላለሁ?",
        a: "Contact us through our Telegram channel or email at deluxethiopia@gmail.com with details about the listing. Our team will investigate promptly.",
        aAm: "ስለ ዝርዝሩ ዝርዝሮች በቴሌግራም ቻናላችን ወይም በኢሜይል deluxethiopia@gmail.com ያግኙን። ቡድናችን በፍጥነት ይመረምራል።",
      },
    ],
  },
  {
    icon: CreditCard,
    title: "Supporting Delux",
    titleAm: "ዴሉክስን መደገፍ",
    questions: [
      {
        q: "How can I support Delux?",
        qAm: "ዴሉክስን እንዴት መደገፍ እችላለሁ?",
        a: "You can support us by buying us a coffee through our Buy Me a Coffee page. Your donations help keep the platform running and improve our services.",
        aAm: "በBuy Me a Coffee ገጻችን ቡና በመግዛት ሊደግፉን ይችላሉ። ልገሳዎችዎ መድረኩን ለመስራት እና አገልግሎቶቻችንን ለማሻሻል ይረዳሉ።",
      },
      {
        q: "Is my donation secure?",
        qAm: "ልገሳዬ ደህንነቱ የተጠበቀ ነው?",
        a: "Yes, all donations are processed securely through Buy Me a Coffee's payment system. We never have access to your payment details.",
        aAm: "አዎ፣ ሁሉም ልገሳዎች በBuy Me a Coffee የክፍያ ስርዓት በተጠበቀ ሁኔታ ይሰራሉ። የክፍያ ዝርዝሮችዎን በጭራሽ አንደርስም።",
      },
    ],
  },
];

export default function FAQ() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 gradient-hero py-16">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center">
              <HelpCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {language === "en" ? "Frequently Asked" : "በተደጋጋሚ የሚጠየቁ"}{" "}
              <span className="text-gradient">
                {language === "en" ? "Questions" : "ጥያቄዎች"}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {language === "en"
                ? "Find answers to common questions about using Delux. Can't find what you're looking for? Contact us!"
                : "ዴሉክስ ስለመጠቀም ለተለመዱ ጥያቄዎች መልሶችን ያግኙ። የሚፈልጉትን ማግኘት አልቻሉም? ያግኙን!"}
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                className="bg-card rounded-2xl p-6 shadow-card border border-border"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    {language === "en" ? category.title : category.titleAm}
                  </h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        {language === "en" ? faq.q : faq.qAm}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {language === "en" ? faq.a : faq.aAm}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center bg-card rounded-2xl p-8 shadow-card border border-border">
            <h3 className="text-xl font-semibold mb-2">
              {language === "en" ? "Still have questions?" : "አሁንም ጥያቄዎች አሉዎት?"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "en"
                ? "We're here to help! Reach out to us through any of our channels."
                : "ለመርዳት ዝግጁ ነን! በማንኛውም የእኛ ቻናሎች ያግኙን።"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://t.me/Delux_ET"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Telegram: @Delux_ET
              </a>
              <span className="text-muted-foreground">|</span>
              <a
                href="mailto:deluxethiopia@gmail.com"
                className="text-primary hover:underline"
              >
                deluxethiopia@gmail.com
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
