"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Layers, MapPin } from "lucide-react";

// Dynamically import the map so it only renders on the client side
const RadiusMap = dynamic(() => import("@/components/maps/RadiusMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-xl border border-slate-200">
      <p className="text-secondary-muted font-medium">Loading local intelligence map...</p>
    </div>
  ),
});

const LAYER_OPTIONS = [
  "Population",
  "Businesses",
  "Competitors",
  "Roads",
  "Markets",
  "Schools",
  "Hospitals",
  "Banks",
  "Transport",
  "Demand",
];

export const LocationIntelligenceMap = () => {
  const [radius, setRadius] = useState<5 | 10 | 20>(10);
  const [activeLayers, setActiveLayers] = useState<string[]>(["Population", "Competitors"]);
  
  // Dummy center coordinate for UI purpose (e.g., Pune area)
  const center: [number, number] = [18.5204, 73.8567];

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[600px]">
      {/* Controls Panel */}
      <div className="w-full md:w-64 flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2">
        <div>
          <h3 className="text-sm font-semibold text-secondary flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            Radius (km)
          </h3>
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            {[5, 10, 20].map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r as 5 | 10 | 20)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  radius === r
                    ? "bg-primary text-white"
                    : "bg-white text-secondary hover:bg-slate-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-secondary flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-primary" />
            Map Layers
          </h3>
          <div className="flex flex-col gap-2">
            {LAYER_OPTIONS.map((layer) => {
              const isActive = activeLayers.includes(layer);
              return (
                <button
                  key={layer}
                  onClick={() => toggleLayer(layer)}
                  className={`px-3 py-2 text-left text-sm font-medium rounded-md transition-colors border ${
                    isActive
                      ? "bg-primary-light/10 border-primary-light text-primary"
                      : "bg-white border-slate-200 text-secondary-muted hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {layer}
                    <div className={`w-3 h-3 rounded-full ${isActive ? "bg-primary" : "bg-slate-200"}`} />
                  </div>
                </button>
              );
            })}
          </div>
          {activeLayers.length === 0 && (
            <p className="text-xs text-red-500 mt-2">No data layers selected.</p>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 rounded-xl overflow-hidden shadow-inner border border-slate-200 relative">
        <RadiusMap center={center} radiusInKm={radius} markers={[]} />
        
        {/* Mock visual overlay for "API loading/empty state" */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur text-xs p-3 rounded-lg border border-slate-200 shadow-sm z-[400]">
          <p className="font-medium text-secondary">
            Displaying {radius}km radius. Selected layers: {activeLayers.join(", ") || "None"}
          </p>
          <p className="text-secondary-muted mt-1">
            * Geographic data is static mock. Awaiting backend API connection for real location intelligence.
          </p>
        </div>
      </div>
    </div>
  );
};
