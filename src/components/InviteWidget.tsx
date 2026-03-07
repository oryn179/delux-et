import { Gift, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function InviteWidget() {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => navigate("/referral")}
        className="relative bg-card border border-border rounded-xl shadow-lg p-3 flex items-center gap-3 hover:shadow-elevated transition-all group"
      >
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
          <Gift className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="text-left pr-6">
          <p className="text-sm font-semibold">Invite & Earn</p>
          <p className="text-xs text-muted-foreground">Get 20 ETB per invite</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          className="absolute top-1 right-1 p-1 rounded-full hover:bg-secondary"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </button>
    </div>
  );
}
