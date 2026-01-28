import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CompareContextType {
  compareList: string[];
  addToCompare: (propertyId: string) => void;
  removeFromCompare: (propertyId: string) => void;
  clearCompare: () => void;
  isInCompare: (propertyId: string) => boolean;
  canAddMore: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<string[]>(() => {
    const saved = localStorage.getItem("delux-compare");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("delux-compare", JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (propertyId: string) => {
    if (compareList.length < MAX_COMPARE && !compareList.includes(propertyId)) {
      setCompareList((prev) => [...prev, propertyId]);
    }
  };

  const removeFromCompare = (propertyId: string) => {
    setCompareList((prev) => prev.filter((id) => id !== propertyId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (propertyId: string) => compareList.includes(propertyId);

  const canAddMore = compareList.length < MAX_COMPARE;

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        canAddMore,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
