import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSupportMessages(userId: string | undefined) {
  return useQuery({
    queryKey: ["support-messages", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    refetchInterval: 5000,
  });
}

export function useAllSupportChats() {
  return useQuery({
    queryKey: ["all-support-chats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Group by user_id
      const grouped: Record<string, any[]> = {};
      (data || []).forEach((msg) => {
        if (!grouped[msg.user_id]) grouped[msg.user_id] = [];
        grouped[msg.user_id].push(msg);
      });
      // Sort each group ascending
      Object.values(grouped).forEach((msgs) => msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
      return grouped;
    },
    refetchInterval: 5000,
  });
}

export function useSendSupportMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, message }: { userId: string; message: string }) => {
      const { data, error } = await supabase
        .from("support_messages")
        .insert({ user_id: userId, message, is_admin_reply: false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-messages"] });
    },
  });
}

export function useSendAdminReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, message, adminId }: { userId: string; message: string; adminId: string }) => {
      const { data, error } = await supabase
        .from("support_messages")
        .insert({ user_id: userId, message, is_admin_reply: true, admin_id: adminId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-support-chats"] });
    },
  });
}
