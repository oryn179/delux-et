import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/contexts/CompareContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CompareButtonProps {
  propertyId: string;
  variant?: "icon" | "full";
  className?: string;
}

export function CompareButton({ propertyId, variant = "icon", className }: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const { toast } = useToast();
  const inCompare = isInCompare(propertyId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCompare) {
      removeFromCompare(propertyId);
      toast({ title: "Removed from compare" });
    } else if (canAddMore) {
      addToCompare(propertyId);
      toast({ title: "Added to compare", description: "Go to Compare page to see side-by-side" });
    } else {
      toast({
        title: "Compare limit reached",
        description: "You can only compare up to 4 properties",
        variant: "destructive",
      });
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        className={cn(
          "rounded-full h-9 w-9",
          inCompare && "bg-primary text-primary-foreground hover:bg-primary/90",
          className
        )}
      >
        <Scale className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={inCompare ? "default" : "outline"}
      onClick={handleClick}
      className={cn("gap-2", inCompare && "gradient-primary border-0", className)}
    >
      <Scale className="h-4 w-4" />
      {inCompare ? "Remove from Compare" : "Add to Compare"}
    </Button>
  );
}
