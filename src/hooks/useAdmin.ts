import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!userId,
  });
}
