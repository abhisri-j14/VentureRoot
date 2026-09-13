import React from "react";

interface PageFooterProps {
  className?: string;
  light?: boolean;
}

export const PageFooter: React.FC<PageFooterProps> = ({
  className = "",
  light = false,
}) => {
  return (
    <footer
      role="contentinfo"
      className={`w-full py-4 text-center text-[11px] sm:text-xs font-normal tracking-wide select-none ${
        light ? "text-slate-300/80" : "text-slate-400/80"
      } ${className}`}
    >
      © 2026 VentureRoot. All rights reserved.
    </footer>
  );
};

export default PageFooter;
