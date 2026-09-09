"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

interface MagneticButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "gold" | "gold-translucent" | "espresso" | "espresso-translucent";
  strength?: number; // 0 to 1, default 0.32
  maxDistance?: number; // Max pixel pull, default 14
  innerStrength?: number; // 0 to 1, default 0.14
  spotlightColor?: string;
  ariaLabel?: string;
}

export const MagneticButton = ({
  href,
  onClick,
  children,
  className = "",
  variant = "primary",
  strength = 0.32,
  maxDistance = 14,
  innerStrength = 0.14,
  spotlightColor,
  ariaLabel,
}: MagneticButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Position motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const innerX = useMotionValue(0);
  const innerY = useMotionValue(0);

  // Cursor spotlight coordinates inside the button
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // High quality spring physics for viscous, fluid pull & snap-back
  const springConfig = { damping: 16, stiffness: 220, mass: 0.1 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);
  const smoothInnerX = useSpring(innerX, springConfig);
  const smoothInnerY = useSpring(innerY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // Relative mouse coordinates within the button for spotlight
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);

    // Clamped magnetic displacement for outer container
    const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX * strength));
    const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY * strength));
    x.set(clampedX);
    y.set(clampedY);

    // Subtle parallax shift for inner content (text + icon)
    const maxInnerDistance = maxDistance * 0.45;
    const clampedInnerX = Math.max(
      -maxInnerDistance,
      Math.min(maxInnerDistance, deltaX * innerStrength)
    );
    const clampedInnerY = Math.max(
      -maxInnerDistance,
      Math.min(maxInnerDistance, deltaY * innerStrength)
    );
    innerX.set(clampedInnerX);
    innerY.set(clampedInnerY);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smoothly snap back to origin
    x.set(0);
    y.set(0);
    innerX.set(0);
    innerY.set(0);
  };

  // Default styling presets
  const variantStyles = {
    primary:
      "bg-gradient-to-b from-[#145318] via-[#104714] to-[#0A340D] text-white border border-emerald-400/25 shadow-[0_12px_28px_-6px_rgba(10,52,13,0.45),0_4px_12px_-2px_rgba(10,52,13,0.25)] hover:shadow-[0_18px_36px_-6px_rgba(10,52,13,0.55),0_6px_16px_-2px_rgba(10,52,13,0.32)]",
    secondary:
      "bg-white/85 hover:bg-white text-[#192A1A] border border-[#200813]/14 hover:border-[#145318]/40 backdrop-blur-xl shadow-[0_8px_22px_-6px_rgba(32,8,19,0.12),0_2px_8px_-2px_rgba(32,8,19,0.06)] hover:shadow-[0_14px_30px_-6px_rgba(32,8,19,0.18),0_4px_12px_-2px_rgba(32,8,19,0.09)]",
    outline:
      "bg-transparent hover:bg-white/40 text-[#200813] border border-[#200813]/25 backdrop-blur-md shadow-sm",
    gold:
      "bg-gradient-to-b from-[#c2af05] via-[#b3a104] to-[#9c8c02] text-white border border-[#ebd834]/40 shadow-[0_12px_28px_-6px_rgba(179,161,4,0.48),0_4px_12px_-2px_rgba(179,161,4,0.25)] hover:shadow-[0_18px_36px_-6px_rgba(179,161,4,0.58),0_6px_16px_-2px_rgba(179,161,4,0.35)]",
    "gold-translucent":
      "bg-[#b3a104]/15 hover:bg-[#b3a104]/25 text-[#3b3501] border border-[#b3a104]/35 hover:border-[#b3a104]/60 backdrop-blur-xl shadow-[0_8px_22px_-6px_rgba(179,161,4,0.15),0_2px_8px_-2px_rgba(179,161,4,0.08)] hover:shadow-[0_14px_30px_-6px_rgba(179,161,4,0.22),0_4px_12px_-2px_rgba(179,161,4,0.12)]",
    espresso:
      "bg-gradient-to-b from-[#4a200a] via-[#361606] to-[#250d03] text-white border border-[#632c12]/45 shadow-[0_12px_28px_-6px_rgba(54,22,6,0.5),0_4px_12px_-2px_rgba(54,22,6,0.28)] hover:shadow-[0_18px_36px_-6px_rgba(54,22,6,0.62),0_6px_16px_-2px_rgba(54,22,6,0.38)]",
    "espresso-translucent":
      "bg-[#361606]/15 hover:bg-[#361606]/25 text-[#361606] border border-[#361606]/30 hover:border-[#361606]/55 backdrop-blur-xl shadow-[0_8px_22px_-6px_rgba(54,22,6,0.14),0_2px_8px_-2px_rgba(54,22,6,0.06)] hover:shadow-[0_14px_30px_-6px_rgba(54,22,6,0.2),0_4px_12px_-2px_rgba(54,22,6,0.1)]",
  };

  const primarySpotlight = useMotionTemplate`radial-gradient(circle 100px at ${mouseX}px ${mouseY}px, rgba(52, 211, 153, 0.28), transparent 80%)`;
  const secondarySpotlight = useMotionTemplate`radial-gradient(circle 100px at ${mouseX}px ${mouseY}px, rgba(20, 83, 24, 0.12), transparent 80%)`;
  const goldSpotlight = useMotionTemplate`radial-gradient(circle 100px at ${mouseX}px ${mouseY}px, rgba(254, 240, 138, 0.38), transparent 80%)`;
  const goldTranslucentSpotlight = useMotionTemplate`radial-gradient(circle 100px at ${mouseX}px ${mouseY}px, rgba(179, 161, 4, 0.22), transparent 80%)`;
  const espressoSpotlight = useMotionTemplate`radial-gradient(circle 100px at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.24), transparent 80%)`;
  const espressoTranslucentSpotlight = useMotionTemplate`radial-gradient(circle 100px at ${mouseX}px ${mouseY}px, rgba(54, 22, 6, 0.18), transparent 80%)`;

  const dynamicSpotlight =
    spotlightColor ||
    (variant === "espresso"
      ? espressoSpotlight
      : variant === "espresso-translucent"
      ? espressoTranslucentSpotlight
      : variant === "gold"
      ? goldSpotlight
      : variant === "gold-translucent"
      ? goldTranslucentSpotlight
      : variant === "primary"
      ? primarySpotlight
      : secondarySpotlight);

  const content = (
    <motion.div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        x: smoothX,
        y: smoothY,
      }}
      whileTap={{ scale: 0.96 }}
      className={`group relative inline-flex items-center justify-center rounded-full px-6 py-3 cursor-pointer overflow-hidden transition-all duration-200 select-none ${variantStyles[variant]} ${className}`}
    >
      {/* Specular highlight rim at top edge for physical tactile depth */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"
      />

      {/* Cursor-following radial spotlight */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-full"
        style={{
          opacity: isHovered ? 1 : 0,
          background: dynamicSpotlight,
        }}
      />

      {/* Clamped Parallax Inner Content */}
      <motion.span
        style={{
          x: smoothInnerX,
          y: smoothInnerY,
        }}
        className="relative z-10 flex items-center justify-center gap-2 text-[13px] md:text-sm font-semibold tracking-wide"
      >
        {children}
      </motion.span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className="inline-block">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-block bg-transparent border-0 p-0"
    >
      {content}
    </button>
  );
};
