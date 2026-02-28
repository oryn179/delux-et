import { useState } from "react";
import { Search, MapPin, Home, ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-home.jpg";

interface HeroProps {
  onSearch?: (filters: {
    propertyType: string;
    listingType: string;
    area: string;
  }) => void;
}

export function Hero({ onSearch }: HeroProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [propertyType, setPropertyType] = useState(t("hero.propertyType"));
  const [listingType, setListingType] = useState(t("hero.rentSell"));
  const [area, setArea] = useState(t("hero.location"));

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ propertyType, listingType, area });
    }
    const listingsSection = document.getElementById("listings");
    if (listingsSection) {
      listingsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
                {t("hero.title")}{" "}
                <span className="text-gradient">{t("hero.titleHighlight")}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                {t("hero.description")}
              </p>
            </div>

            <p className="text-sm text-muted-foreground border-l-2 border-primary pl-4">
              {t("hero.shortDesc")}
            </p>

            <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border">
              <div className="grid sm:grid-cols-4 gap-3">
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select 
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-11 pl-10 pr-8 rounded-lg bg-secondary border-0 text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                  >
                    <option>{t("hero.propertyType")}</option>
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Villa 🏡</option>
                    <option>Real Estate</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <div className="relative">
                  <select 
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-secondary border-0 text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                  >
                    <option>{t("hero.rentSell")}</option>
                    <option>{t("hero.forRent")}</option>
                    <option>{t("hero.forSell")}</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select 
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full h-11 pl-10 pr-8 rounded-lg bg-secondary border-0 text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
                  >
                    <option>{t("hero.location")}</option>
                    <option>Bole</option>
                    <option>Kazanchis</option>
                    <option>Piassa Arada</option>
                    <option>CMC</option>
                    <option>Megenagna</option>
                    <option>Sidist Kilo</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <Button onClick={handleSearch} className="h-11 gradient-primary border-0 gap-2">
                  <Search className="h-4 w-4" />
                  {t("hero.search")}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button 
                size="lg" 
                className="gradient-primary border-0 gap-2"
                onClick={() => {
                  const listingsSection = document.getElementById("listings");
                  if (listingsSection) {
                    listingsSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                {t("hero.browseFree")}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate("/list-property")}
              >
                {t("hero.listHome")}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">{t("hero.freeService")}</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">{t("hero.listedHomes")}</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-primary">1K+</p>
                <p className="text-sm text-muted-foreground">{t("hero.happyFamilies")}</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img
                src={heroImage}
                alt="Beautiful furnished home interior"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-elevated border border-border animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                  <Home className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{t("hero.findingPopular")}</p>
                  <p className="text-sm text-muted-foreground">Addis Ababa, Piassa Arada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
