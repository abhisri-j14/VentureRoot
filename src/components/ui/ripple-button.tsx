"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface RippleButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
}

export const RippleButton = ({ href, children, className = "", rippleColor = "bg-white/10" }: RippleButtonProps) => {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <Link
      href={href}
      ref={buttonRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group flex items-center justify-center ${className}`}
    >
      <motion.div
        animate={{
          x: mousePos.x - 150,
          y: mousePos.y - 150,
          scale: isHovering ? 1 : 0.5,
          opacity: isHovering ? 1 : 0,
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.4 }}
        className={`absolute top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none mix-blend-soft-light ${rippleColor}`}
      />
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
    </Link>
  );
};
