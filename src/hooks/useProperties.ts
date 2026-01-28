import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
type PropertyImage = Database["public"]["Tables"]["property_images"]["Row"];
export interface PropertyWithImages extends Property {
  property_images: PropertyImage[];
}

export interface SearchFilters {
  propertyType?: string;
  listingType?: string;
  area?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  furnished?: boolean;
  features?: string[];
}

export function useProperties(filters?: SearchFilters) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      let query = supabase
        .from("properties")
        .select(`
          *,
          property_images(*)
        `)
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (filters?.propertyType && filters.propertyType !== "Property Type") {
        const typeMap: Record<string, Database["public"]["Enums"]["property_type"]> = {
          "Apartment": "apartment",
          "House": "house",
          "Villa 🏡": "villa",
          "Real Estate": "real-estate",
        };
        const dbType = typeMap[filters.propertyType];
        if (dbType) {
          query = query.eq("property_type", dbType);
        }
      }

      if (filters?.listingType && filters.listingType !== "Rent / Sell") {
        const typeMap: Record<string, Database["public"]["Enums"]["listing_type"]> = {
          "For Rent": "rent",
          "For Sell": "sell",
        };
        const dbType = typeMap[filters.listingType];
        if (dbType) {
          query = query.eq("listing_type", dbType);
        }
      }

      if (filters?.area && filters.area !== "Location") {
        query = query.eq("area", filters.area);
      }

      if (filters?.bedrooms && filters.bedrooms > 0) {
        query = query.eq("bedrooms", filters.bedrooms);
      }

      if (filters?.furnished !== undefined) {
        query = query.eq("furnished", filters.furnished);
      }

      if (filters?.minPrice) {
        query = query.gte("price", filters.minPrice.toString());
      }

      if (filters?.maxPrice) {
        query = query.lte("price", filters.maxPrice.toString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as PropertyWithImages[];
    },
  });
}

export function usePropertiesByIds(ids: string[]) {
  return useQuery({
    queryKey: ["properties-by-ids", ids],
    queryFn: async () => {
      if (!ids || ids.length === 0) return [];
      
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          property_images(*)
        `)
        .in("id", ids);

      if (error) throw error;
      return data as unknown as PropertyWithImages[];
    },
    enabled: ids.length > 0,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          property_images(*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as PropertyWithImages | null;
    },
    enabled: !!id,
  });
}

export function useOwnerProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["owner-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUserProperties(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-properties", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("properties")
        .select(`*, property_images(*)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (property: PropertyInsert) => {
      const { data, error } = await supabase
        .from("properties")
        .insert(property)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["user-properties"] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["user-properties"] });
    },
  });
}

export function useUploadPropertyImage() {
  return useMutation({
    mutationFn: async ({ file, userId }: { file: File; userId: string }) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("property-images")
        .getPublicUrl(fileName);

      return data.publicUrl;
    },
  });
}

export function useAddPropertyImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      imageUrl,
      isPrimary,
    }: {
      propertyId: string;
      imageUrl: string;
      isPrimary: boolean;
    }) => {
      const { data, error } = await supabase
        .from("property_images")
        .insert({
          property_id: propertyId,
          image_url: imageUrl,
          is_primary: isPrimary,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
}
