'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function CloudLoader() {
  return (
    <div className="flex min-h-[160px] items-center justify-center overflow-hidden">
      <div className="relative isolate flex h-24 w-48 items-center justify-center">

        {/* 1. PRIMARY - Deep Green */}
        <motion.div
          className="absolute z-30 flex items-center justify-center"
          animate={{
            x: [-46, -23, 46, 23, -46],
            y: [7, -7, 0, 7, 7],
            scale: [0.75, 0.95, 1.2, 0.95, 0.75],
            opacity: [0.5, 0.8, 1, 0.8, 0.5],
          }}
          transition={{
            duration: 3.8,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <div className="h-4 w-4 rounded-full bg-[#1E6702] shadow-[0_0_12px_rgba(30,103,2,0.75),0_0_24px_rgba(30,103,2,0.3)]" />
        </motion.div>

        {/* 2. SECONDARY - Coffee Brown */}
        <motion.div
          className="absolute z-10 flex items-center justify-center"
          animate={{
            x: [38, 19, -38, -19, 38],
            y: [-4, 7, 3, -7, -4],
            scale: [1, 0.88, 0.68, 0.88, 1],
            opacity: [0.95, 0.72, 0.45, 0.72, 0.95],
          }}
          transition={{
            duration: 5.6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <div className="h-6 w-6 rounded-full bg-[#200813] shadow-[0_0_16px_rgba(32,8,19,0.7),0_0_30px_rgba(32,8,19,0.25)]" />
        </motion.div>

        {/* 3. ACCENT - Soft Gold / Amber */}
        <motion.div
          className="absolute z-40 flex items-center justify-center"
          animate={{
            x: [-27, -17, 27, 17, -27],
            y: [2, -5, 0, 5, 2],
            scale: [0.82, 0.95, 1.12, 0.95, 0.82],
            opacity: [0.65, 0.85, 1, 0.85, 0.65],
          }}
          transition={{
            duration: 3.1,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <div className="h-5 w-5 rounded-full bg-[#d97706] shadow-[0_0_14px_rgba(217,119,6,0.75),0_0_26px_rgba(217,119,6,0.3)]" />
        </motion.div>

        {/* 4. BACKGROUND - Light Lime */}
        <motion.div
          className="absolute z-20 flex items-center justify-center"
          animate={{
            x: [64, 43, 0, -43, -64, -20, 64],
            y: [6, -5, 3, -5, 6, -2, 6],
            scale: [0.55, 0.7, 1, 0.7, 0.55, 0.8, 0.55],
            opacity: [0.35, 0.6, 0.9, 0.6, 0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 6.4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <div className="h-3.5 w-3.5 rounded-full bg-[#84cc16] shadow-[0_0_12px_rgba(132,204,22,0.8),0_0_24px_rgba(132,204,22,0.35)]" />
        </motion.div>

      </div>
    </div>
  );
}
