import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useReferralCode(userId: string | undefined) {
  return useQuery({
    queryKey: ["referral-code", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        // Generate if missing
        const { data: newData, error: insertError } = await supabase
          .from("referral_codes")
          .insert({ user_id: userId, code: generateLocalCode() })
          .select("code")
          .single();
        if (insertError) throw insertError;
        return newData?.code;
      }
      return data.code;
    },
    enabled: !!userId,
  });
}

function generateLocalCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return (
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)] +
    Math.floor(Math.random() * 10) +
    "" +
    Math.floor(Math.random() * 10)
  );
}

export function useReferralStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["referral-stats", userId],
    queryFn: async () => {
      if (!userId) return { count: 0, credited: 0 };
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", userId);
      if (error) throw error;
      return {
        count: data?.length || 0,
        credited: data?.filter((r: any) => r.credited).length || 0,
      };
    },
    enabled: !!userId,
  });
}

export function useApplyReferralCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, userId }: { code: string; userId: string }) => {
      // Look up the referrer
      const { data: referralCode, error: lookupError } = await supabase
        .from("referral_codes")
        .select("user_id")
        .eq("code", code.toUpperCase())
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (!referralCode) throw new Error("Invalid referral code");
      if (referralCode.user_id === userId) throw new Error("You cannot use your own referral code");

      // Insert referral record
      const { error } = await supabase
        .from("referrals")
        .insert({ referrer_id: referralCode.user_id, referred_user_id: userId });
      if (error) {
        if (error.code === "23505") throw new Error("You have already used a referral code");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-stats"] });
    },
  });
}
