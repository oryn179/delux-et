import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          *,
          properties(
            *,
            property_images(*),
            profiles!properties_user_id_fkey(name, phone, verified)
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      propertyId,
    }: {
      userId: string;
      propertyId: string;
    }) => {
      const { data, error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, property_id: propertyId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      propertyId,
    }: {
      userId: string;
      propertyId: string;
    }) => {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("property_id", propertyId);

      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });
}
