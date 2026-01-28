import { useNavigate } from "react-router-dom";
import { Scale, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/contexts/CompareContext";

export function CompareBar() {
  const navigate = useNavigate();
  const { compareList, clearCompare } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-full shadow-lg px-4 py-2 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <span className="font-medium">{compareList.length} properties</span>
        </div>
        
        <Button
          size="sm"
          onClick={() => navigate("/compare")}
          className="gradient-primary border-0 rounded-full gap-1"
        >
          Compare Now
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={clearCompare}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
