"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown, Check, Sparkles, X } from "lucide-react";

export interface IndianStateItem {
  name: string;
  code: string;
  type: "State" | "Union Territory";
  region: "Northern" | "Southern" | "Western" | "Eastern" | "Central" | "North-Eastern";
}

export const ALL_INDIAN_STATES_AND_UTS: IndianStateItem[] = [
  // 28 States
  { name: "Andhra Pradesh", code: "AP", type: "State", region: "Southern" },
  { name: "Arunachal Pradesh", code: "AR", type: "State", region: "North-Eastern" },
  { name: "Assam", code: "AS", type: "State", region: "North-Eastern" },
  { name: "Bihar", code: "BR", type: "State", region: "Eastern" },
  { name: "Chhattisgarh", code: "CG", type: "State", region: "Central" },
  { name: "Goa", code: "GA", type: "State", region: "Western" },
  { name: "Gujarat", code: "GJ", type: "State", region: "Western" },
  { name: "Haryana", code: "HR", type: "State", region: "Northern" },
  { name: "Himachal Pradesh", code: "HP", type: "State", region: "Northern" },
  { name: "Jharkhand", code: "JH", type: "State", region: "Eastern" },
  { name: "Karnataka", code: "KA", type: "State", region: "Southern" },
  { name: "Kerala", code: "KL", type: "State", region: "Southern" },
  { name: "Madhya Pradesh", code: "MP", type: "State", region: "Central" },
  { name: "Maharashtra", code: "MH", type: "State", region: "Western" },
  { name: "Manipur", code: "MN", type: "State", region: "North-Eastern" },
  { name: "Meghalaya", code: "ML", type: "State", region: "North-Eastern" },
  { name: "Mizoram", code: "MZ", type: "State", region: "North-Eastern" },
  { name: "Nagaland", code: "NL", type: "State", region: "North-Eastern" },
  { name: "Odisha", code: "OD", type: "State", region: "Eastern" },
  { name: "Punjab", code: "PB", type: "State", region: "Northern" },
  { name: "Rajasthan", code: "RJ", type: "State", region: "Northern" },
  { name: "Sikkim", code: "SK", type: "State", region: "North-Eastern" },
  { name: "Tamil Nadu", code: "TN", type: "State", region: "Southern" },
  { name: "Telangana", code: "TG", type: "State", region: "Southern" },
  { name: "Tripura", code: "TR", type: "State", region: "North-Eastern" },
  { name: "Uttar Pradesh", code: "UP", type: "State", region: "Northern" },
  { name: "Uttarakhand", code: "UK", type: "State", region: "Northern" },
  { name: "West Bengal", code: "WB", type: "State", region: "Eastern" },

  // 8 Union Territories
  { name: "Andaman and Nicobar Islands", code: "AN", type: "Union Territory", region: "Southern" },
  { name: "Chandigarh", code: "CH", type: "Union Territory", region: "Northern" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DN", type: "Union Territory", region: "Western" },
  { name: "Delhi", code: "DL", type: "Union Territory", region: "Northern" },
  { name: "Jammu and Kashmir", code: "JK", type: "Union Territory", region: "Northern" },
  { name: "Ladakh", code: "LA", type: "Union Territory", region: "Northern" },
  { name: "Lakshadweep", code: "LD", type: "Union Territory", region: "Southern" },
  { name: "Puducherry", code: "PY", type: "Union Territory", region: "Southern" },
];

interface StateAutocompleteInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (stateName: string, item: IndianStateItem) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  inputClassName?: string;
  name?: string;
  id?: string;
}

export const StateAutocompleteInput: React.FC<StateAutocompleteInputProps> = ({
  value = "",
  onChange,
  onSelect,
  placeholder = "Type state name (e.g. Gujarat, Maharashtra, Punjab)...",
  label,
  required = false,
  disabled = false,
  error,
  className = "",
  inputClassName = "",
  name = "state",
  id,
}) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter states based on query
  const filteredStates = React.useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return ALL_INDIAN_STATES_AND_UTS;

    return ALL_INDIAN_STATES_AND_UTS.filter((item) => {
      const nameLower = item.name.toLowerCase();
      const codeLower = item.code.toLowerCase();
      return nameLower.includes(clean) || codeLower === clean;
    }).sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(clean);
      const bStarts = b.name.toLowerCase().startsWith(clean);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [query]);

  const handleSelectState = (item: IndianStateItem) => {
    setQuery(item.name);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onChange) onChange(item.name);
    if (onSelect) onSelect(item.name, item);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setHighlightedIndex(-1);

    if (onChange) onChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredStates.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredStates.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredStates.length) {
        handleSelectState(filteredStates[highlightedIndex]);
      } else if (filteredStates.length > 0) {
        handleSelectState(filteredStates[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative w-full flex items-center">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none transition-all focus:border-[#1E6702] focus:ring-2 focus:ring-[#1E6702]/10 disabled:bg-slate-100 disabled:cursor-not-allowed pr-10 shadow-xs ${inputClassName}`}
        />

        <div className="absolute right-3 flex items-center gap-1 pointer-events-none text-slate-400">
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#1E6702]" : ""}`} />
        </div>
      </div>

      {error && <p className="text-red-500 font-sans text-xs font-medium mt-0.5">{error}</p>}

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto animate-in fade-in duration-150">
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Select Indian State / UT</span>
            <span className="text-[10px] text-emerald-700 font-bold lowercase">
              {filteredStates.length} {filteredStates.length === 1 ? "option" : "options"}
            </span>
          </div>

          {filteredStates.length > 0 ? (
            <div className="py-1">
              {filteredStates.map((item, idx) => {
                const isSelected = query.trim().toLowerCase() === item.name.toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectState(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2 text-sm transition-colors ${
                      isHighlighted
                        ? "bg-[#1E6702]/10 text-[#1E6702] font-bold"
                        : isSelected
                        ? "bg-emerald-50 text-[#1E6702] font-semibold"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected || isHighlighted ? "text-[#1E6702]" : "text-slate-400"}`} />
                      <span className="truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {item.type === "Union Territory" ? "UT" : item.code}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#1E6702]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-4 text-center text-xs text-slate-500 font-medium">
              No Indian state matching &quot;{query}&quot; found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
