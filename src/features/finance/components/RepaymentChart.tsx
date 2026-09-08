"use client";

import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { useRepaymentSchedule } from "@/lib/data/finance";

const MORATORIUM_COLOR = "#d1d5db";
const PRINCIPAL_COLOR  = "#094f9e";
const INTEREST_COLOR   = "#8e90f5";

export const RepaymentChart = ({ businessId }: { businessId: string }) => {
  const { data } = useRepaymentSchedule(businessId);

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="period"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `₹${v / 1000}k`}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px -4px rgba(0,0,0,0.1)",
              fontSize: 13,
            }}
            formatter={(value, name) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, String(name)]}
          />
          <Legend
            wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
            formatter={(value) => <span style={{ color: "#475569", fontWeight: 500 }}>{value}</span>}
          />
          <Bar dataKey="principal" name="Principal (₹)" stackId="a" fill={PRINCIPAL_COLOR} radius={[0, 0, 4, 4]} />
          <Bar dataKey="interest"  name="Interest (₹)"  stackId="a" fill={INTEREST_COLOR}  radius={[4, 4, 0, 0]}>
            {data.map((entry: any, i: number) =>
              entry.isMoratorium
                ? <Cell key={i} fill={MORATORIUM_COLOR} />
                : <Cell key={i} fill={INTEREST_COLOR} />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="font-sans text-[12px] text-center text-gray-400 mt-2">
        Grey bars indicate moratorium quarters (interest only). Illustrative data.
      </p>
    </div>
  );
};
