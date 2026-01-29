import { cn } from "@/lib/utils";

interface PriceTagProps {
  price: string;
  type: "rent" | "sell";
  className?: string;
}

export function PriceTag({ price, type, className }: PriceTagProps) {
  return (
    <div className={cn("relative inline-flex items-center", className)}>
      {/* Tag shape with string */}
      <div className="relative">
        {/* String/Loop */}
        <div className="absolute -top-3 left-3 w-4 h-4">
          <div className="w-3 h-3 border-2 border-primary/60 rounded-full" />
          <div className="absolute top-2 left-1 w-0.5 h-2 bg-primary/60 rotate-12" />
        </div>
        
        {/* Main tag body */}
        <div 
          className="relative bg-gradient-to-br from-[hsl(85,80%,50%)] to-[hsl(100,70%,40%)] text-white px-4 py-2 rounded-lg font-bold shadow-lg"
          style={{
            boxShadow: `
              0 0 15px hsl(85 80% 50% / 0.5),
              0 0 30px hsl(85 80% 50% / 0.3),
              0 4px 12px hsl(0 0% 0% / 0.15)
            `,
          }}
        >
          {/* Hole punch effect */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/30" />
          
          {/* Price text */}
          <span className="ml-2 text-base drop-shadow-md">
            {formatPrice(price)} ETB
            {type === "rent" && (
              <span className="text-xs font-normal opacity-90">/mo</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: string): string {
  const num = parseFloat(price.replace(/,/g, ''));
  if (isNaN(num)) return price;
  return num.toLocaleString('en-US');
}
