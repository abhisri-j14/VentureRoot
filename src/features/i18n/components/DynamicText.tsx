"use client";

import React from "react";
import { useUIStore } from "@/stores/useUIStore";
import { useDynamicTranslation } from "../services/translateService";

interface DynamicTextProps {
  text: string;
  as?: React.ElementType;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Component for translating dynamic, user-generated, or AI-generated strings on the fly
 */
export const DynamicText: React.FC<DynamicTextProps> = ({
  text,
  as: Component = "span",
  className = "",
  fallback,
}) => {
  const language = useUIStore((s) => s.language);
  const { translated, isLoading } = useDynamicTranslation(text, language);

  if (isLoading && fallback) {
    return <>{fallback}</>;
  }

  return (
    <Component className={className}>
      {translated}
    </Component>
  );
};
