"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export const CountUp = ({
  to,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  separator = false,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: boolean;
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const count = useMotionValue(0);

  const rounded = useTransform(count, (latest) => {
    const numStr = latest.toFixed(decimals);
    const parts = numStr.split(".");
    if (separator) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return `${prefix}${parts.join(".")}${suffix}`;
  });

  useEffect(() => {
    if (hasAnimated) return;
    
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (prefersReducedMotion) {
      count.set(to);
      setHasAnimated(true);
      return;
    }

    const controls = animate(count, to, {
      duration: duration,
      ease: "easeOut",
      onComplete: () => setHasAnimated(true),
    });

    return controls.stop;
  }, [count, to, duration, hasAnimated]);

  return <motion.span>{rounded}</motion.span>;
};
