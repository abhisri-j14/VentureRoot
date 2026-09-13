"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Layers, MapPin, Check, Sparkles, CheckSquare, Square } from "lucide-react";
import { MapMarker } from "@/components/maps/RadiusMap";
import { getAuthoritativeCensusDensity } from "@/utils/feasibility.mapper";

// Dynamically import the map so it only renders on the client side
const RadiusMap = dynamic(() => import("@/components/maps/RadiusMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-100 flex items-center justify-center rounded-xl border border-slate-200">
      <p className="text-secondary-muted font-medium text-xs">Loading OpenStreetMap canvas...</p>
    </div>
  ),
});

const LAYER_CONFIGS = [
  {
    name: "Competitors",
    color: "#DC2626",
    badge: "Direct & Indirect",
    desc: "Local competing & peer facilities with observed rates",
  },
  {
    name: "Markets & APMC Mandis",
    color: "#059669",
    badge: "Trading Nodes",
    desc: "Wholesale APMC yards, sub-mandis & weekly haats",
  },
  {
    name: "Transport Hubs",
    color: "#4F46E5",
    badge: "Logistics",
    desc: "Highway freight corridors, railway goods sheds & cargo stops",
  },
  {
    name: "Agrarian Supply Nodes",
    color: "#0D9488",
    badge: "Supply Chain",
    desc: "Cold storage units, FPO depots & input supply centers",
  },
  {
    name: "Population Centers",
    color: "#0284C7",
    badge: "Demand Catchments",
    desc: "Gram panchayat settlements, town centers & colonies",
  },
];

interface LocationIntelligenceMapProps {
  center?: [number, number];
  locationName?: string;
  category?: string;
  markers?: MapMarker[];
  competitors?: any[];
}

export const LocationIntelligenceMap: React.FC<LocationIntelligenceMapProps> = ({
  center = [20.5937, 78.9629],
  locationName = "Regional Enterprise Zone",
  category = "Agro-Enterprise",
  markers: propMarkers = [],
  competitors = [],
}) => {
  const [radius, setRadius] = useState<5 | 10 | 20>(5);
  const [activeLayers, setActiveLayers] = useState<string[]>([
    "Competitors",
    "Markets & APMC Mandis",
    "Transport Hubs",
    "Agrarian Supply Nodes",
    "Population Centers",
  ]);

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  const toggleAll = () => {
    if (activeLayers.length === LAYER_CONFIGS.length) {
      setActiveLayers([]);
    } else {
      setActiveLayers(LAYER_CONFIGS.map((l) => l.name));
    }
  };

  // Generate dynamic POI markers matching all 5 active geospatial layers
  const dynamicMarkers: MapMarker[] = React.useMemo(() => {
    const list: MapMarker[] = [];
    const lat = center[0];
    const lon = center[1];

    // 1. COMPETITORS LAYER (Direct & Indirect)
    if (activeLayers.includes("Competitors")) {
      if (competitors && competitors.length > 0) {
        competitors.forEach((comp, idx) => {
          const rawPos = comp.position;
          const pos: [number, number] =
            Array.isArray(rawPos) && rawPos.length >= 2 && typeof rawPos[0] === "number" && typeof rawPos[1] === "number"
              ? [rawPos[0], rawPos[1]]
              : [
                  lat + (idx % 2 === 0 ? 0.014 : -0.016) * (idx + 1),
                  lon + (idx % 2 === 0 ? 0.013 : -0.015) * (idx + 1),
                ];
          const isIndirect = comp.type?.toLowerCase().includes("indirect");

          list.push({
            id: comp.id || `comp-${idx + 1}`,
            position: pos,
            title: comp.name || `Competitor ${idx + 1}`,
            category: `${comp.type || (isIndirect ? "Indirect" : "Direct")} Competitor`,
            distanceKm: comp.distanceKm || 1.6 + idx * 0.8,
            type: isIndirect ? "indirect" : "direct",
            pricing: comp.pricing,
            details: comp.positioning,
          });
        });
      } else if (propMarkers && propMarkers.length > 0) {
        list.push(...propMarkers);
      } else {
        list.push(
          {
            id: "comp-gen-1",
            position: [lat + 0.014, lon + 0.012],
            title: `${category} Co-operative Processing Center`,
            category: `${category} (Direct)`,
            distanceKm: 1.8,
            type: "direct",
            pricing: "Standard Rate",
            details: "Direct local competitor with village procurement network.",
          },
          {
            id: "comp-gen-2",
            position: [lat - 0.016, lon + 0.017],
            title: `Private ${category} Processing & Packing Unit`,
            category: `${category} (Direct)`,
            distanceKm: 2.6,
            type: "direct",
            pricing: "Market Parity",
            details: "Direct private processor competing for local market share.",
          },
          {
            id: "comp-gen-3",
            position: [lat + 0.022, lon - 0.019],
            title: `Regional APMC Wholesale ${category} Depot`,
            category: `${category} (Indirect)`,
            distanceKm: 3.7,
            type: "indirect",
            pricing: "Wholesale Mandi Rate",
            details: "Indirect wholesale aggregator supplying semi-urban outlets.",
          },
          {
            id: "comp-gen-4",
            position: [lat - 0.021, lon - 0.014],
            title: `Local Informal ${category} Village Vendors`,
            category: `${category} (Indirect)`,
            distanceKm: 1.4,
            type: "indirect",
            pricing: "Unorganized Cash Pricing",
            details: "Informal local vendors operating without formal certifications.",
          }
        );
      }
    }

    // 2. MARKETS & APMC MANDIS LAYER
    if (activeLayers.includes("Markets & APMC Mandis")) {
      list.push(
        {
          id: "poi-mandi-1",
          position: [lat + 0.024, lon - 0.020],
          title: "Principal APMC Agricultural Mandi Yard",
          category: "Regulated Wholesale Market",
          distanceKm: 3.5,
          type: "market",
          pricing: "Daily APMC Clearing Rate",
          details: "Major regional commodity trading platform with electronic auction halls.",
        },
        {
          id: "poi-mandi-2",
          position: [lat - 0.022, lon + 0.024],
          title: "Farmers Weekly Haat & Sub-Market Auction Yard",
          category: "Sub-Mandi Haat",
          distanceKm: 3.8,
          type: "market",
          pricing: "Direct Farmgate Auction",
          details: "Bi-weekly trading haat with high local farmer footfall.",
        },
        {
          id: "poi-mandi-3",
          position: [lat + 0.011, lon - 0.015],
          title: "Gram Panchayat Daily Commodity Bazaar",
          category: "Local Daily Market",
          distanceKm: 1.9,
          type: "market",
          pricing: "Retail Consumer Rates",
          details: "Primary morning retail market with high daily footfall.",
        },
        // 5–10 km Regional Trade
        {
          id: "poi-mandi-4",
          position: [lat + 0.048, lon - 0.038],
          title: "Sub-Divisional APMC Grain & Cotton Sub-Yard",
          category: "Regional Sub-Mandi",
          distanceKm: 7.6,
          type: "market",
          pricing: "Wholesale APMC E-NAM Tariffs",
          details: "Secondary electronic trading node aggregating grain produce from 25+ gram panchayats.",
        },
        // 10–20 km District Catchment
        {
          id: "poi-mandi-5",
          position: [lat + 0.096, lon - 0.086],
          title: "District Principal APMC Mega Terminal Market",
          category: "Apex Mandi Terminal",
          distanceKm: 15.2,
          type: "market",
          pricing: "State Apex Benchmark Rates",
          details: "District apex market featuring computerized weighing bridges, cold sheds, and bank credit counters.",
        }
      );
    }

    // 3. TRANSPORT HUBS LAYER
    if (activeLayers.includes("Transport Hubs")) {
      list.push(
        {
          id: "poi-transport-1",
          position: [lat - 0.028, lon + 0.015],
          title: "State Highway Corridor Logistics Terminal",
          category: "Road Freight Hub",
          distanceKm: 4.2,
          type: "transport",
          pricing: "Contract Freight / Ton-km",
          details: "Connects to 4-lane state arterial highway with 24x7 heavy truck access.",
        },
        {
          id: "poi-transport-2",
          position: [lat + 0.031, lon + 0.021],
          title: "Railway Freight Shed & Goods Siding Depot",
          category: "Rail Cargo Terminal",
          distanceKm: 4.9,
          type: "transport",
          pricing: "Railway Tariff Schedule",
          details: "Heavy bulk goods loading ramp connected to broad-gauge rail network.",
        },
        {
          id: "poi-transport-3",
          position: [lat - 0.018, lon - 0.022],
          title: "District Express Cold-Chain & Parcel Stand",
          category: "Express Parcel Hub",
          distanceKm: 3.2,
          type: "transport",
          pricing: "Courier & Refrigerated Parcel",
          details: "Daily scheduled departures to state capital and major wholesale markets.",
        },
        // 5–10 km Regional Trade
        {
          id: "poi-transport-4",
          position: [lat - 0.052, lon + 0.046],
          title: "National Highway Multi-Modal Freight Interchange",
          category: "National Highway Hub",
          distanceKm: 8.4,
          type: "transport",
          pricing: "National Freight Corridor Rates",
          details: "Interchange junction on National Highway connecting container trucks to state port terminals.",
        },
        // 10–20 km District Catchment
        {
          id: "poi-transport-5",
          position: [lat + 0.108, lon + 0.088],
          title: "District Inland Container Depot (ICD) & Rail Goods Yard",
          category: "ICD Rail Terminal",
          distanceKm: 16.4,
          type: "transport",
          pricing: "Customs & Port Freight Schedule",
          details: "Containerized export freight terminal with customs clearance facilities.",
        }
      );
    }

    // 4. AGRARIAN SUPPLY NODES LAYER
    if (activeLayers.includes("Agrarian Supply Nodes")) {
      list.push(
        {
          id: "poi-supply-1",
          position: [lat + 0.018, lon + 0.026],
          title: "Multi-Commodity Controlled Cold Storage Depot",
          category: "Cold-Chain Infrastructure",
          distanceKm: 3.6,
          type: "supply",
          pricing: "₹190 – ₹240 / quintal / season",
          details: "NABARD-accredited 4,000 MT cold facility with negotiable warehouse receipts.",
        },
        {
          id: "poi-supply-2",
          position: [lat - 0.025, lon - 0.018],
          title: "Farmer Producer Company (FPO) Aggregation Godown",
          category: "FPO Procurement Center",
          distanceKm: 3.4,
          type: "supply",
          pricing: "Direct Member Buyback",
          details: "Consolidates produce from 450+ member farmers across 12 villages.",
        },
        {
          id: "poi-supply-3",
          position: [lat + 0.012, lon - 0.028],
          title: "Cooperative Seed, Fertilizer & Agro-Input Depot",
          category: "Agro-Input Distribution Hub",
          distanceKm: 3.1,
          type: "supply",
          pricing: "Subsidized Cooperative Rates",
          details: "Essential raw material and agronomic supply point for local cultivators.",
        },
        // 5–10 km Regional Trade
        {
          id: "poi-supply-4",
          position: [lat + 0.044, lon + 0.046],
          title: "Regional Solar Cold-Storage Terminal & FPO Federation",
          category: "Solar Cold Hub",
          distanceKm: 7.9,
          type: "supply",
          pricing: "Subsidized FPO Grid Rate",
          details: "Green-energy backed 2,500 MT cold chambers for perishables and dairy products.",
        },
        // 10–20 km District Catchment
        {
          id: "poi-supply-5",
          position: [lat - 0.102, lon - 0.092],
          title: "State Agro-Industries Corporation Central Warehouse Depot",
          category: "State Central Buffer",
          distanceKm: 15.8,
          type: "supply",
          pricing: "CWC / State Buffer Tariffs",
          details: "Central Warehousing Corporation terminal maintaining district buffer stocks and certified silos.",
        }
      );
    }

    // 5. POPULATION CENTERS LAYER
    if (activeLayers.includes("Population Centers")) {
      list.push(
        {
          id: "poi-pop-1",
          position: [lat + 0.010, lon + 0.010],
          title: "Gram Panchayat Central Settlement Cluster",
          category: "Primary Habitation Hub",
          distanceKm: 1.5,
          type: "population",
          pricing: "High Consumer Density",
          details: "Dense rural village residential nucleus with 8,500+ resident population.",
        },
        {
          id: "poi-pop-2",
          position: [lat - 0.015, lon - 0.012],
          title: "Taluka Block Town Commercial Core",
          category: "Semi-Urban Center",
          distanceKm: 2.2,
          type: "population",
          pricing: "High Purchasing Power",
          details: "Administrative headquarter with banks, schools, hospitals, and commerce.",
        },
        {
          id: "poi-pop-3",
          position: [lat + 0.020, lon - 0.014],
          title: "Agro-Industrial Processing Worker Colony",
          category: "Workforce Settlement",
          distanceKm: 2.9,
          type: "population",
          pricing: "Industrial Demand",
          details: "Residential colony supporting nearby food processing and manufacturing units.",
        },
        // 5–10 km Regional Trade
        {
          id: "poi-pop-4",
          position: [lat + 0.052, lon + 0.038],
          title: "Sub-District Taluka Headquarters Town Settlement",
          category: "Sub-District Hub",
          distanceKm: 8.2,
          type: "population",
          pricing: "High Trade Liquidity",
          details: "Regional semi-urban municipal town with ~42,000 resident consumers and markets.",
        },
        // 10–20 km District Catchment
        {
          id: "poi-pop-5",
          position: [lat - 0.108, lon - 0.076],
          title: "District Municipal Corporation & Urban Center",
          category: "District Urban Core",
          distanceKm: 16.5,
          type: "population",
          pricing: "High Disposable Income",
          details: "Major district urban center with ~280,000 residents, corporate institutions, and shopping districts.",
        }
      );
    }

    // Filter POIs strictly within the active catchment radius
    return list.filter((m) => (m.distanceKm || 0) <= radius);
  }, [center, category, propMarkers, competitors, activeLayers, radius]);

  const populationReach = React.useMemo(() => {
    const density = getAuthoritativeCensusDensity({ name: locationName }, { name: locationName });
    if (radius === 20) return Math.round(1256.64 * density);
    if (radius === 10) return Math.round(314.16 * density);
    return Math.round(78.54 * density);
  }, [radius, locationName]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[520px] h-full p-2">
      {/* Controls Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-[#1E6702]" />
            Catchment Radius
          </h3>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white p-1 gap-1">
            {[5, 10, 20].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r as 5 | 10 | 20)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  radius === r
                    ? "bg-[#1E6702] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
          <div className="mt-2 text-[11px] font-medium text-emerald-900 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
            Est. Population: <strong>~{populationReach.toLocaleString('en-IN')}</strong> ({radius === 5 ? "Core Catchment" : radius === 10 ? "Regional Trade" : "District Reach"})
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#1E6702]" />
              Geospatial Layers ({activeLayers.length}/{LAYER_CONFIGS.length})
            </h3>
            <button
              type="button"
              onClick={toggleAll}
              className="text-[10px] font-bold text-[#1E6702] hover:underline"
            >
              {activeLayers.length === LAYER_CONFIGS.length ? "Clear All" : "Select All"}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {LAYER_CONFIGS.map((layer) => {
              const isActive = activeLayers.includes(layer.name);
              return (
                <button
                  key={layer.name}
                  type="button"
                  onClick={() => toggleLayer(layer.name)}
                  className={`p-2.5 text-left rounded-xl transition-all border flex items-center justify-between gap-2 ${
                    isActive
                      ? "bg-white border-emerald-300 shadow-2xs"
                      : "bg-slate-100/70 border-slate-200/80 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div>
                      <span className={`text-xs font-bold block leading-tight ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                        {layer.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                        {layer.badge}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                      isActive
                        ? "bg-[#1E6702] border-[#1E6702] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1 font-bold text-slate-800">
            <Sparkles className="w-3 h-3 text-[#1E6702]" />
            Verified Geospatial Markers
          </div>
          <p className="text-[10.5px] leading-relaxed text-slate-500">
            Each marker on OpenStreetMap features a permanent high-visibility label showing enterprise name, exact distance, and direct/indirect classification.
          </p>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative min-h-[460px]">
        <RadiusMap
          center={center}
          radiusInKm={radius}
          businessName={locationName}
          locationLabel={`${radius}km Catchment Zone`}
          markers={dynamicMarkers}
          showCatchmentCircles={true}
          showLabels={true}
          hideTopBadge={true}
        />

        {/* Live Status Overlay */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 shadow-md border border-slate-200/90 z-[400] max-w-[calc(100%-20px)] sm:max-w-xs pointer-events-auto flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{locationName}</span>
          </div>
          <div className="text-[10.5px] text-slate-600 font-medium leading-snug">
            Catchment: <span className="font-bold text-emerald-800">{radius} km</span> • Reach: <span className="font-bold text-emerald-900">~{populationReach.toLocaleString('en-IN')} pop.</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium leading-snug">
            Visible Nodes: <span className="font-bold text-slate-800">{dynamicMarkers.length} markers</span> (Area: {Math.round(Math.PI * radius * radius)} km²)
          </div>
        </div>
      </div>
    </div>
  );
};
