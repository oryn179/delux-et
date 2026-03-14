import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useOwnerRequest(userId: string | undefined) {
  return useQuery({
    queryKey: ["owner-request", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("owner_requests")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useSubmitOwnerRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, phone }: { userId: string; phone: string }) => {
      const { data, error } = await supabase
        .from("owner_requests")
        .insert({ user_id: userId, phone })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["owner-request", userId] });
    },
  });
}

export function useAllOwnerRequests() {
  return useQuery({
    queryKey: ["all-owner-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owner_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}
