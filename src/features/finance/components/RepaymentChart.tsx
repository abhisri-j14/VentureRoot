"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";

/* ── Static mock data — to be replaced by POST /api/v1/finance/repayment endpoint ── */
const mockRepaymentData = [
  { period: "Q1", principal: 0, interest: 15000, isMoratorium: true },
  { period: "Q2", principal: 0, interest: 15000, isMoratorium: true },
  { period: "Q3", principal: 25000, interest: 14000, isMoratorium: false },
  { period: "Q4", principal: 25000, interest: 13000, isMoratorium: false },
];

export const RepaymentChart = () => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={mockRepaymentData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="period" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
          <Tooltip 
            cursor={{ fill: "#f8fafc" }} 
            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Bar dataKey="principal" name="Principal (₹)" stackId="a" fill="#094f9e" radius={[0, 0, 4, 4]} />
          <Bar dataKey="interest" name="Interest (₹)" stackId="a" fill="#8e90f5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center mt-4">
        <MockDisclaimer text="Currently showing mock data • Financial schedule API integration pending" />
      </div>
    </div>
  );
};
