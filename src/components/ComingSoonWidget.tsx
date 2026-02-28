import { useState, useEffect } from "react";
import { Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ComingSoonWidget() {
  const [title, setTitle] = useState("Coming Soon");
  const [message, setMessage] = useState("Mobile app, advanced filters & more features are on the way!");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("system_settings")
        .select("key, value")
        .in("key", ["coming_soon_title", "coming_soon_message"]);
      
      if (data) {
        const titleSetting = data.find(s => s.key === "coming_soon_title");
        const messageSetting = data.find(s => s.key === "coming_soon_message");
        if (titleSetting?.value) setTitle(String(titleSetting.value).replace(/^"|"$/g, ''));
        if (messageSetting?.value) setMessage(String(messageSetting.value).replace(/^"|"$/g, ''));
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="fixed left-4 bottom-4 z-40">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 max-w-[200px] animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <Rocket className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
