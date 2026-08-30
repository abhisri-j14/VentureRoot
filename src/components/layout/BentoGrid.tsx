import React from "react";

export const BentoGrid = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 ${className}`}>
    {children}
  </div>
);
