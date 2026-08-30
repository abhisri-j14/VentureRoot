"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════
   1. FEASIBILITY RING (Custom SVG)
   ═══════════════════════════════════════ */
export const FeasibilityRing = ({ value, label }: { value: number; label?: string }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#FFFBE7"
          strokeWidth="6"
          fill="transparent"
          className="opacity-50"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#1E6702"
          strokeWidth="6"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-heading font-bold text-[#200813]">{value}</span>
        {label && <span className="text-[10px] uppercase font-bold text-[#200813]/50 tracking-wider mt-1">{label}</span>}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   2. EDITORIAL AREA CHART
   ═══════════════════════════════════════ */
export const EditorialAreaChart = ({ data, xKey, yKey }: { data: any[]; xKey: string; yKey: string }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1E6702" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1E6702" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#200813" opacity={0.05} />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: "#200813", opacity: 0.5, fontSize: 12 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#200813", opacity: 0.5, fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 10px 40px -10px rgba(32,8,19,0.1)" }}
          itemStyle={{ color: "#1E6702", fontWeight: "bold" }}
        />
        <Area type="monotone" dataKey={yKey} stroke="#1E6702" strokeWidth={3} fillOpacity={1} fill="url(#colorY)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/* ═══════════════════════════════════════
   3. EDITORIAL DONUT CHART
   ═══════════════════════════════════════ */
const COLORS = ["#1E6702", "#144801", "#4A8F29", "#A6C796", "#E3F0D9"];

export const EditorialDonutChart = ({ data, nameKey, valueKey, innerRadius = 60, outerRadius = 80 }: { data: any[]; nameKey: string; valueKey: string; innerRadius?: number | string; outerRadius?: number | string }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey={valueKey}
          nameKey={nameKey}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 10px 40px -10px rgba(32,8,19,0.1)" }}
          itemStyle={{ color: "#200813", fontWeight: "bold" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

/* ═══════════════════════════════════════
   3b. MINI SPARKLINE (For dashboard summaries)
   ═══════════════════════════════════════ */
export const MiniSparkline = ({ data, yKey }: { data: any[]; yKey: string }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1E6702" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#1E6702" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={yKey} stroke="#1E6702" strokeWidth={2} fillOpacity={1} fill="url(#colorSpark)" isAnimationActive={true} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/* ═══════════════════════════════════════
   4. EDITORIAL RADAR CHART (COMPARE)
   ═══════════════════════════════════════ */
export const EditorialRadarChart = ({ data, subjectKey, comparisonKey, nameKey }: { data: any[]; subjectKey: string; comparisonKey: string; nameKey: string }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#200813" strokeOpacity={0.05} />
        <PolarAngleAxis dataKey={nameKey} tick={{ fill: "#200813", opacity: 0.6, fontSize: 12, fontWeight: 600 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        
        <Radar
          name="My Business"
          dataKey={subjectKey}
          stroke="#1E6702"
          strokeWidth={2}
          fill="#1E6702"
          fillOpacity={0.4}
        />
        <Radar
          name="Local Average"
          dataKey={comparisonKey}
          stroke="#200813"
          strokeWidth={2}
          strokeDasharray="4 4"
          fill="#200813"
          fillOpacity={0.05}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 10px 40px -10px rgba(32,8,19,0.1)" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

/* ═══════════════════════════════════════
   5. EDITORIAL BAR CHART
   ═══════════════════════════════════════ */
export const EditorialBarChart = ({ data, xKey, yKey, color = "#1E6702" }: { data: any[]; xKey: string; yKey: string; color?: string }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#200813" opacity={0.05} />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: "#200813", opacity: 0.5, fontSize: 12 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#200813", opacity: 0.5, fontSize: 12 }} />
        <Tooltip
          cursor={{ fill: "rgba(32,8,19,0.02)" }}
          contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 10px 40px -10px rgba(32,8,19,0.1)" }}
          itemStyle={{ color: "#200813", fontWeight: "bold" }}
        />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
