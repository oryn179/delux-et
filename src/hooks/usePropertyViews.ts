import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface PropertyView {
  id: string;
  property_id: string;
  viewer_id: string | null;
  viewed_at: string;
  ip_hash: string | null;
}

// Hook to record a property view
export function useRecordPropertyView(propertyId: string, userId?: string) {
  const queryClient = useQueryClient();

  const recordView = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("property_views")
        .insert({
          property_id: propertyId,
          viewer_id: userId || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-views", propertyId] });
    },
  });

  // Record view on mount (once per session)
  useEffect(() => {
    const sessionKey = `viewed_${propertyId}`;
    const hasViewed = sessionStorage.getItem(sessionKey);

    if (!hasViewed && propertyId) {
      recordView.mutate();
      sessionStorage.setItem(sessionKey, "true");
    }
  }, [propertyId]);

  return recordView;
}

// Hook to get view count for a property
export function usePropertyViewCount(propertyId: string) {
  return useQuery({
    queryKey: ["property-views", propertyId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("property_views")
        .select("*", { count: "exact", head: true })
        .eq("property_id", propertyId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!propertyId,
  });
}

// Hook to get view analytics for all user properties
export function useUserPropertyViews(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-property-views", userId],
    queryFn: async () => {
      if (!userId) return [];

      // First get user's properties
      const { data: properties, error: propError } = await supabase
        .from("properties")
        .select("id, title")
        .eq("user_id", userId);

      if (propError) throw propError;
      if (!properties || properties.length === 0) return [];

      const propertyIds = properties.map((p) => p.id);

      // Get all views for user's properties
      const { data: views, error: viewsError } = await supabase
        .from("property_views")
        .select("*")
        .in("property_id", propertyIds)
        .order("viewed_at", { ascending: false });

      if (viewsError) throw viewsError;

      return views as PropertyView[];
    },
    enabled: !!userId,
  });
}

// Hook to get total views count for all user properties
export function useTotalUserViews(userId: string | undefined) {
  return useQuery({
    queryKey: ["total-user-views", userId],
    queryFn: async () => {
      if (!userId) return 0;

      // Get user's properties
      const { data: properties, error: propError } = await supabase
        .from("properties")
        .select("id")
        .eq("user_id", userId);

      if (propError) throw propError;
      if (!properties || properties.length === 0) return 0;

      const propertyIds = properties.map((p) => p.id);

      // Count views
      const { count, error } = await supabase
        .from("property_views")
        .select("*", { count: "exact", head: true })
        .in("property_id", propertyIds);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
}
