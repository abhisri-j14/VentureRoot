import React from "react";

export const BentoCard = ({
  children,
  title,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-[24px] shadow-soft border border-black/[0.04] p-6 lg:p-8 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-[0_12px_45px_-10px_rgba(32,8,19,0.12)] hover:-translate-y-[2px] ${className}`}
  >
    {title && (
      <h3 className="font-sans font-semibold text-xs tracking-wider uppercase text-[#200813]/50 mb-5 relative z-10">
        {title}
      </h3>
    )}
    <div className="flex-1">{children}</div>
  </div>
);
