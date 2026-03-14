import { Home, Search } from "lucide-react";

interface UserTypeToggleProps {
  userType: "seeker" | "owner";
  onChange: (type: "seeker" | "owner") => void;
}

export function UserTypeToggle({ userType, onChange }: UserTypeToggleProps) {
  return (
    <div className="flex items-center bg-secondary rounded-xl p-1 mb-6">
      <button
        type="button"
        onClick={() => onChange("seeker")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
          userType === "seeker"
            ? "bg-card shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Search className="h-4 w-4" />
        Home Seeker
      </button>
      <button
        type="button"
        onClick={() => onChange("owner")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
          userType === "owner"
            ? "bg-card shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Home className="h-4 w-4" />
        Home Owner
      </button>
    </div>
  );
}
