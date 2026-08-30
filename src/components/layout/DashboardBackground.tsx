"use client";

import { motion } from "framer-motion";
import { Leaf, Brain, IndianRupee, TrendingUp, Sparkles } from "lucide-react";

const FloatingElement = ({ 
  children, 
  delay, 
  duration, 
  className 
}: { 
  children: React.ReactNode, 
  delay: number, 
  duration: number, 
  className: string 
}) => {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: [-15, 15, -15], opacity: 1 }}
      transition={{
        y: { duration, repeat: Infinity, ease: "easeInOut", delay },
        opacity: { duration: 1, ease: "easeOut" }
      }}
    >
      {children}
    </motion.div>
  );
};

export const DashboardBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
      {/* 3D Sphere 1 (Top Left) */}
      <FloatingElement delay={0} duration={8} className="top-[10%] left-[15%] w-32 h-32 opacity-70">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,_#ffffff,_#e6f0d1_60%,_#c2d1a3)] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.03),_10px_10px_30px_rgba(32,8,19,0.06)]" />
      </FloatingElement>

      {/* 3D Sphere 2 (Bottom Right) */}
      <FloatingElement delay={2} duration={10} className="bottom-[15%] right-[10%] w-48 h-48 opacity-60">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,_#ffffff,_#e6f0d1_60%,_#c2d1a3)] shadow-[inset_-15px_-15px_30px_rgba(0,0,0,0.03),_15px_15px_40px_rgba(32,8,19,0.06)] flex items-center justify-center">
          <Leaf className="w-12 h-12 text-[#1E6702]/20" />
        </div>
      </FloatingElement>

      {/* 3D Sphere 3 (Center Bottom) */}
      <FloatingElement delay={1} duration={9} className="bottom-[5%] left-[45%] w-20 h-20 opacity-80">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,_#ffffff,_#e6f0d1_60%,_#c2d1a3)] shadow-[inset_-5px_-5px_10px_rgba(0,0,0,0.03),_5px_5px_15px_rgba(32,8,19,0.06)] flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-[#1E6702]/30" />
        </div>
      </FloatingElement>

      {/* 3D Sphere 4 (Center Right) */}
      <FloatingElement delay={3} duration={11} className="top-[40%] right-[20%] w-24 h-24 opacity-75">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,_#ffffff,_#e6f0d1_60%,_#c2d1a3)] shadow-[inset_-8px_-8px_15px_rgba(0,0,0,0.03),_8px_8px_20px_rgba(32,8,19,0.06)] flex items-center justify-center">
          <Brain className="w-8 h-8 text-[#1E6702]/30" />
        </div>
      </FloatingElement>
      
      {/* Small floating accents */}
      <FloatingElement delay={4} duration={7} className="top-[25%] right-[40%] w-12 h-12 opacity-60">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,_#ffffff,_#e6f0d1_60%,_#c2d1a3)] shadow-sm flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#1E6702]/40" />
        </div>
      </FloatingElement>

      <FloatingElement delay={1.5} duration={8.5} className="bottom-[35%] left-[25%] w-16 h-16 opacity-70">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_30%_30%,_#ffffff,_#e6f0d1_60%,_#c2d1a3)] shadow-sm flex items-center justify-center">
          <IndianRupee className="w-5 h-5 text-[#1E6702]/40" />
        </div>
      </FloatingElement>
    </div>
  );
};
