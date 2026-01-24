import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";

export interface Property {
  id: number;
  image: string;
  images: string[];
  title: string;
  description: string;
  location: string;
  city: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  type: "rent" | "sell";
  propertyType: "apartment" | "villa" | "house" | "real-estate";
  furnished: boolean;
  isFree: boolean;
  price?: string;
  owner: {
    name: string;
    phone: string;
    verified: boolean;
  };
  features: string[];
  createdAt: string;
}

export const properties: Property[] = [
  {
    id: 1,
    image: property1,
    images: [property1, property2, property3],
    title: "Modern Family Home",
    description: "A beautiful, spacious family home located in the heart of Piassa, Arada. This fully furnished property features modern amenities, a large living area, and a private garden. Perfect for families looking for comfort and convenience.",
    location: "Addis Ababa, Piassa Arada",
    city: "Addis Ababa",
    area: "Piassa Arada",
    bedrooms: 3,
    bathrooms: 2,
    type: "rent",
    propertyType: "house",
    furnished: true,
    isFree: true,
    owner: {
      name: "Solomon Tesfaye",
      phone: "+251 91 234 5678",
      verified: true,
    },
    features: ["Garden", "Parking", "Security", "Modern Kitchen"],
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    image: property2,
    images: [property2, property1, property4],
    title: "Cozy Furnished Apartment",
    description: "A comfortable and cozy apartment in the vibrant Bole area. Ideal for professionals or small families. Close to restaurants, shops, and public transport.",
    location: "Addis Ababa, Bole",
    city: "Addis Ababa",
    area: "Bole",
    bedrooms: 2,
    bathrooms: 1,
    type: "rent",
    propertyType: "apartment",
    furnished: true,
    isFree: true,
    owner: {
      name: "Meron Hailu",
      phone: "+251 92 345 6789",
      verified: true,
    },
    features: ["Balcony", "24/7 Water", "Elevator", "Near Metro"],
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    image: property3,
    images: [property3, property1, property2],
    title: "Luxury Villa with Pool",
    description: "Stunning luxury villa with a private swimming pool in the exclusive CMC area. Features 5 bedrooms, modern design, and landscaped gardens. Perfect for those seeking premium living.",
    location: "Addis Ababa, CMC",
    city: "Addis Ababa",
    area: "CMC",
    bedrooms: 5,
    bathrooms: 4,
    type: "sell",
    propertyType: "villa",
    furnished: true,
    isFree: false,
    price: "Contact Owner",
    owner: {
      name: "Dawit Bekele",
      phone: "+251 93 456 7890",
      verified: true,
    },
    features: ["Swimming Pool", "Garden", "Garage", "Smart Home", "Generator"],
    createdAt: "2024-01-25",
  },
  {
    id: 4,
    image: property4,
    images: [property4, property2, property3],
    title: "Modern Apartment Complex",
    description: "Brand new apartment in a modern complex in Kazanchis. Features contemporary design, excellent security, and proximity to business centers.",
    location: "Addis Ababa, Kazanchis",
    city: "Addis Ababa",
    area: "Kazanchis",
    bedrooms: 2,
    bathrooms: 2,
    type: "rent",
    propertyType: "apartment",
    furnished: false,
    isFree: true,
    owner: {
      name: "Tigist Alemayehu",
      phone: "+251 94 567 8901",
      verified: true,
    },
    features: ["Security", "Parking", "Gym", "Rooftop Access"],
    createdAt: "2024-02-01",
  },
  {
    id: 5,
    image: property1,
    images: [property1, property3, property4],
    title: "Spacious G+2 House",
    description: "A grand three-story house perfect for large families or as an investment property. Located in a quiet neighborhood with easy access to main roads.",
    location: "Addis Ababa, Megenagna",
    city: "Addis Ababa",
    area: "Megenagna",
    bedrooms: 6,
    bathrooms: 4,
    type: "sell",
    propertyType: "house",
    furnished: false,
    isFree: false,
    price: "Contact Owner",
    owner: {
      name: "Abebe Kebede",
      phone: "+251 95 678 9012",
      verified: true,
    },
    features: ["Large Compound", "Parking for 3 Cars", "Storage Room", "Servant Quarter"],
    createdAt: "2024-02-05",
  },
  {
    id: 6,
    image: property2,
    images: [property2, property4, property1],
    title: "Studio Apartment Near University",
    description: "Perfect for students or young professionals. Compact but comfortable studio apartment near Addis Ababa University.",
    location: "Addis Ababa, Sidist Kilo",
    city: "Addis Ababa",
    area: "Sidist Kilo",
    bedrooms: 1,
    bathrooms: 1,
    type: "rent",
    propertyType: "apartment",
    furnished: true,
    isFree: true,
    owner: {
      name: "Hanna Girma",
      phone: "+251 96 789 0123",
      verified: false,
    },
    features: ["Near University", "Furnished", "Quiet Area", "Public Transport"],
    createdAt: "2024-02-10",
  },
];

export function getPropertyById(id: number): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getPropertiesByIds(ids: number[]): Property[] {
  return properties.filter((p) => ids.includes(p.id));
}
