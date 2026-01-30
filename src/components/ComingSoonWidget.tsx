import { Rocket } from "lucide-react";

export function ComingSoonWidget() {
  return (
    <div className="fixed left-4 bottom-4 z-40">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 max-w-[200px] animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <Rocket className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Coming Soon</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Mobile app, advanced filters & more features are on the way!
        </p>
      </div>
    </div>
  );
}
