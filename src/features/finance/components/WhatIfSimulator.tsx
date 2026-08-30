"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { financeApi } from "../api/financeApi";

export const WhatIfSimulator = () => {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);
  const isSimple = role === "ENTREPRENEUR";
  
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(9);
  const [tenure, setTenure] = useState(60);
  const [moratorium, setMoratorium] = useState(6);
  const [revenue, setRevenue] = useState(50000);
  const [expenses, setExpenses] = useState(30000);
  
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    
    try {
      await financeApi.simulate({
        loanAmount,
        interestRate,
        tenure,
        moratorium,
        revenue,
        expenses,
      });

      // TODO: BACKEND CONFIRMATION REQUIRED
      // Response schema is unknown. Cannot consume response to render results.
      setIsSimulating(false);
      alert("Simulation payload sent to API successfully. Backend integration pending.");
    } catch (error: any) {
      console.warn("Backend request failed or offline. Simulation currently unavailable.");
      alert("Simulation failed: Backend offline. Please try again later.");
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Controls */}
      <div className="w-full md:w-1/2 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-secondary-muted mb-2" suppressHydrationWarning>
            {isSimple ? "Money you may need" : "Loan Amount"}: ₹{loanAmount.toLocaleString('en-IN')}
          </label>
          <input
            type="range"
            min="50000"
            max="2000000"
            step="50000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-muted mb-2">
            {isSimple ? "Yearly Interest" : "Interest Rate"}: {interestRate}%
          </label>
          <input
            type="range"
            min="1"
            max="24"
            step="0.5"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-muted mb-2">
              {isSimple ? "Time to Repay" : "Tenure (Months)"}
            </label>
            <select
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 p-2 bg-white"
            >
              <option value="12">12 Months</option>
              <option value="24">24 Months</option>
              <option value="36">36 Months</option>
              <option value="48">48 Months</option>
              <option value="60">60 Months</option>
              <option value="84">84 Months</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-muted mb-2">
              {isSimple ? "Time before paying" : "Moratorium"}
            </label>
            <select
              value={moratorium}
              onChange={(e) => setMoratorium(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 p-2 bg-white"
            >
              <option value="0">None</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-muted mb-2" suppressHydrationWarning>
            {isSimple ? "Expected money coming in" : "Monthly Revenue"}: ₹{revenue.toLocaleString('en-IN')}
          </label>
          <input
            type="range"
            min="5000"
            max="500000"
            step="5000"
            value={revenue}
            onChange={(e) => setRevenue(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-muted mb-2" suppressHydrationWarning>
            {isSimple ? "Expected money going out" : "Monthly Expenses"}: ₹{expenses.toLocaleString('en-IN')}
          </label>
          <input
            type="range"
            min="5000"
            max="500000"
            step="5000"
            value={expenses}
            onChange={(e) => setExpenses(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="mt-4 w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-light transition-colors disabled:opacity-70"
        >
          {isSimulating ? "Simulating..." : "Run Simulation"}
        </button>
      </div>

      {/* Results */}
      <div className="w-full md:w-1/2">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 h-full flex flex-col">
          <h3 className="text-lg font-heading font-semibold text-secondary mb-4">
            {isSimple ? "What might happen" : "Simulation Results"}
          </h3>
          
          <div className="grid grid-cols-1 gap-4 flex-1">
            <div className="p-4 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
              <span className="text-sm font-medium text-secondary-muted">
                {isSimple ? "If things go great" : "Best Case Scenario"}
              </span>
              <span className="text-sm font-bold text-slate-400">Awaiting simulation</span>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
              <span className="text-sm font-medium text-secondary-muted">
                {isSimple ? "What we expect" : "Expected Case Scenario"}
              </span>
              <span className="text-sm font-bold text-slate-400">Awaiting simulation</span>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
              <span className="text-sm font-medium text-secondary-muted">
                {isSimple ? "If things go poorly" : "Worst Case Scenario"}
              </span>
              <span className="text-sm font-bold text-slate-400">Awaiting simulation</span>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 flex justify-between items-center mt-auto">
              <span className="text-sm font-medium text-secondary-muted">
                {isSimple ? "Is it safe?" : "Loan Risk Assessment"}
              </span>
              <span className="text-sm font-bold text-slate-400">Awaiting simulation</span>
            </div>
          </div>
          
          <p className="text-xs text-secondary-muted mt-4 text-center">
            These values will be generated by the backend financial engine upon running the simulation.
          </p>
        </div>
      </div>
    </div>
  );
};
