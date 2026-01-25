import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useFavorites as useFavoritesQuery, useAddFavorite, useRemoveFavorite } from "@/hooks/useFavorites";

interface FavoritesContextType {
  favorites: string[];
  isLoading: boolean;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: favoritesData, isLoading } = useFavoritesQuery(user?.id);
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const favorites = favoritesData?.map((f) => f.property_id) ?? [];

  const addFavorite = (propertyId: string) => {
    if (!user) return;
    addFavoriteMutation.mutate({ userId: user.id, propertyId });
  };

  const removeFavorite = (propertyId: string) => {
    if (!user) return;
    removeFavoriteMutation.mutate({ userId: user.id, propertyId });
  };

  const isFavorite = (propertyId: string) => {
    return favorites.includes(propertyId);
  };

  const toggleFavorite = (propertyId: string) => {
    if (isFavorite(propertyId)) {
      removeFavorite(propertyId);
    } else {
      addFavorite(propertyId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
