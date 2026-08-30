import React from 'react';

export function MockDisclaimer({ 
  text = "Backend integration pending • Currently showing mock data",
  className = ""
}: { 
  text?: string;
  className?: string; 
}) {
  return (
    <div className={`text-[10px] text-[#200813]/40 mt-1.5 font-medium ${className}`}>
      {text}
    </div>
  );
}
