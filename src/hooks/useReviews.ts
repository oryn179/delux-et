import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  reviewer_id: string;
  owner_id: string;
  property_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_profile?: {
    name: string;
    avatar_url: string | null;
  };
}

export function useOwnerReviews(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", "owner", ownerId],
    queryFn: async () => {
      if (!ownerId) return [];
      
      // Fetch reviews
      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch reviewer profiles
      const reviewerIds = [...new Set(reviewsData.map(r => r.reviewer_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", reviewerIds);
      
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      
      return reviewsData.map(review => ({
        ...review,
        reviewer_profile: profilesMap.get(review.reviewer_id) || { name: "Anonymous", avatar_url: null },
      })) as Review[];
    },
    enabled: !!ownerId,
  });
}

export function useOwnerAverageRating(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["average-rating", ownerId],
    queryFn: async () => {
      if (!ownerId) return null;
      
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("owner_id", ownerId);

      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      return { average: Math.round(average * 10) / 10, count: data.length };
    },
    enabled: !!ownerId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ownerId,
      propertyId,
      rating,
      comment,
    }: {
      ownerId: string;
      propertyId?: string;
      rating: number;
      comment?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          reviewer_id: user.id,
          owner_id: ownerId,
          property_id: propertyId || null,
          rating,
          comment: comment || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { ownerId }) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "owner", ownerId] });
      queryClient.invalidateQueries({ queryKey: ["average-rating", ownerId] });
    },
  });
}

export function useUserCanReview(ownerId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["can-review", ownerId, userId],
    queryFn: async () => {
      if (!ownerId || !userId || ownerId === userId) return false;
      
      // Check if user already reviewed this owner
      const { data, error } = await supabase
        .from("reviews")
        .select("id")
        .eq("reviewer_id", userId)
        .eq("owner_id", ownerId)
        .maybeSingle();

      if (error) throw error;
      return !data; // Can review if no existing review
    },
    enabled: !!ownerId && !!userId && ownerId !== userId,
  });
}
