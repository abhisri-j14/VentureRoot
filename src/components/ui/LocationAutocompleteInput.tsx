"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, X, Check } from "lucide-react";
import { useLocationSearch } from "@/lib/data/locations";

export interface SelectedLocation {
  state: string;
  district: string;
  block?: string;
  village?: string;
  lat?: number;
  lon?: number;
  label: string;
}

interface LocationAutocompleteInputProps {
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  onSelect: (location: SelectedLocation) => void;
  onChangeText?: (text: string) => void;
  required?: boolean;
}

export const LocationAutocompleteInput: React.FC<LocationAutocompleteInputProps> = ({
  value = "",
  placeholder = "Type your district, city, or village (e.g. Pune, Anand, Khed...)",
  label,
  error,
  className = "",
  inputClassName = "",
  onSelect,
  onChangeText,
  required = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const { data: suggestions, isLoading } = useLocationSearch(searchTerm);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onChangeText) onChangeText(val);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleSelect = (item: any) => {
    const d = item.data || {};
    const label =
      item.type === "STATE"
        ? (d.state || item.name || item.state)
        : (item.label || `${d.village || d.block || d.district || item.name}, ${d.state || item.state}`);
    setSearchTerm(label);
    setIsOpen(false);

    const rawLat = d.latitude ?? item.latitude ?? item.lat;
    const rawLon = d.longitude ?? item.longitude ?? item.lon;

    const loc: SelectedLocation = {
      state: d.state || item.state || (item.type === "STATE" ? item.name : ""),
      district: d.district || item.district || (item.type === "DISTRICT" ? item.name : ""),
      block: d.block || item.block || item.taluka || (item.type === "TALUKA" ? item.name : ""),
      village: d.village || item.village || (item.type === "VILLAGE" ? item.name : ""),
      lat: rawLat !== undefined && rawLat !== null && !isNaN(Number(rawLat)) ? Number(rawLat) : undefined,
      lon: rawLon !== undefined && rawLon !== null && !isNaN(Number(rawLon)) ? Number(rawLon) : undefined,
      label,
    };

    onSelect(loc);
  };

  const handleClear = () => {
    setSearchTerm("");
    if (onChangeText) onChangeText("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5 leading-normal break-words whitespace-normal">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 shrink-0 pointer-events-none" />

        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchTerm.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-9 sm:pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm ${
            error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""
          } ${inputClassName}`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />}
          {searchTerm && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-500 font-medium mt-1.5">{error}</p>}

      {/* Suggestion Dropdown */}
      {isOpen && suggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden z-50 max-h-64 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
            <span>Location Suggestions</span>
            <span className="text-[10px] text-emerald-700 font-semibold">OpenStreetMap + India Census</span>
          </div>

          <ul className="py-1">
            {suggestions.map((item: any, idx: number) => {
              const isSelected = idx === selectedIndex;
              const isState = item.type === "STATE";
              const title = isState ? `${item.name} (State)` : (item.district || item.name || item.village || "Unknown");
              const subtitle = isState ? "Indian State / Union Territory" : [item.block, item.district, item.state].filter(Boolean).join(" • ");

              return (
                <li
                  key={item.id || `${item.state}-${item.district}-${idx}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between text-sm transition-colors ${
                    isSelected ? "bg-emerald-50 text-emerald-900 font-semibold" : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <MapPin
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isSelected || isState ? "text-emerald-600" : "text-slate-400"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-slate-900 text-[13px]">{title}</p>
                      <p className="text-xs text-slate-500">{subtitle}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isState
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.type || "India"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {isOpen && searchTerm.trim().length >= 2 && !isLoading && (!suggestions || suggestions.length === 0) && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200/80 p-3 z-50 text-center">
          <p className="text-xs text-slate-500">No matching location found for &ldquo;{searchTerm}&rdquo;</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Try searching by District or State name</p>
        </div>
      )}
    </div>
  );
};
