import { useNavigate } from "react-router-dom";
import { Target, Eye, Percent, Users, MapPin, Shield, Home, Handshake, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const whyDelux = [
    { icon: Percent, title: t("about.100free"), description: t("about.100freeDesc") },
    { icon: Users, title: t("about.communityPowered"), description: t("about.communityPoweredDesc") },
    { icon: MapPin, title: t("about.ethiopiaFocused"), description: t("about.ethiopiaFocusedDesc") },
    { icon: Shield, title: t("about.trustedVerified"), description: t("about.trustedVerifiedDesc") },
  ];

  const whatWeOffer = [
    { icon: Home, title: t("about.freeHomeListings") },
    { icon: Handshake, title: t("about.rentSellOptions") },
    { icon: Search, title: t("about.locationSearch") },
    { icon: Users, title: t("about.directConnection") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="gradient-hero py-20 md:py-28">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
              {t("about.title")} <span className="text-gradient">Delux</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("about.subtitle")}</p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">{t("about.intro")}</p>

              <div className="bg-accent/50 rounded-2xl p-6 md:p-8 mb-12">
                <p className="text-xl font-medium text-center">
                  {t("about.noAgents")} <span className="text-primary">{t("about.justConnection")}</span>
                </p>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">{t("about.whoWeAre")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("about.whoWeAreDesc")}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("about.ourMission")}</h3>
                  <p className="text-muted-foreground">{t("about.ourMissionDesc")}</p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <Eye className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("about.ourVision")}</h3>
                  <p className="text-muted-foreground">{t("about.ourVisionDesc")}</p>
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 text-center">{t("about.whyDelux")}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {whyDelux.map((item, index) => (
                    <div key={index} className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 text-center">{t("about.whatWeOffer")}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {whatWeOffer.map((item, index) => (
                    <div key={index} className="bg-secondary/50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-lg bg-accent mx-auto flex items-center justify-center mb-3">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="font-medium text-sm">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border mb-12">
                <h2 className="text-2xl font-display font-bold mb-4 text-center">{t("about.ourPromise")}</h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">{t("about.ourPromiseDesc")}</p>
              </div>

              <div className="text-center py-8 border-t border-border">
                <p className="text-xl font-medium mb-2">{t("about.notMarketplace")}</p>
                <p className="text-2xl font-display font-bold text-gradient">{t("about.itsConnection")}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button onClick={() => navigate("/")} className="gradient-primary border-0 gap-2" size="lg">
                  {t("about.exploreHomes")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button onClick={() => navigate("/signup")} variant="outline" size="lg">
                  {t("about.joinToday")}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
