import { useNavigate } from "react-router-dom";
import { Percent, Users, MapPin, Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function AboutSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    { icon: Percent, title: t("aboutSection.100free"), description: t("aboutSection.100freeDesc") },
    { icon: Users, title: t("aboutSection.directConnection"), description: t("aboutSection.directConnectionDesc") },
    { icon: MapPin, title: t("aboutSection.communityFirst"), description: t("aboutSection.communityFirstDesc") },
    { icon: Shield, title: t("aboutSection.trustedVerified"), description: t("aboutSection.trustedVerifiedDesc") },
  ];

  return (
    <section id="about" className="py-20">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                {t("aboutSection.title").split("Delux")[0]}<span className="text-gradient">Delux</span>{t("aboutSection.title").includes("?") ? "?" : ""}
              </h2>
              <p className="text-lg text-muted-foreground">{t("aboutSection.subtitle")}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={() => navigate("/about")}>
              {t("aboutSection.learnMore")}
            </Button>
          </div>

          <div className="bg-card rounded-3xl p-8 md:p-10 shadow-elevated border border-border">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6">
              <Home className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
              {t("aboutSection.ownHome")}
            </h3>
            <p className="text-muted-foreground mb-6">{t("aboutSection.ownHomeDesc")}</p>
            <Button 
              size="lg" 
              className="gradient-primary border-0 w-full sm:w-auto"
              onClick={() => navigate("/list-property")}
            >
              {t("aboutSection.listNow")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
