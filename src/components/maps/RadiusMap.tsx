"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom SVG DivIcon for User Location Pin with radar wave pulse
const createUserPinIcon = (label: string = "Your Venture") => {
  return L.divIcon({
    className: "custom-user-pin",
    html: `
      <div style="position: relative; width: 38px; height: 50px; display: flex; align-items: center; justify-content: center;">
        <!-- Pulsing radar wave -->
        <div style="
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 34px;
          height: 34px;
          background: rgba(30, 103, 2, 0.32);
          border: 2px solid #1E6702;
          border-radius: 50%;
          animation: mapPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <!-- Pin Marker Body -->
        <svg width="38" height="50" viewBox="0 0 38 50" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.38)); position: relative; z-index: 2;">
          <path d="M19 0C8.50659 0 0 8.50659 0 19C0 31.5 19 50 19 50C19 50 38 31.5 38 19C38 8.50659 29.4934 0 19 0Z" fill="#1E6702"/>
          <path d="M19 2C9.61116 2 2 9.61116 2 19C2 29.8 19 47 19 47C19 47 36 29.8 36 19C36 9.61116 28.3888 2 19 2Z" fill="url(#userPinGrad)"/>
          <circle cx="19" cy="19" r="9.5" fill="#FFFBE7"/>
          <circle cx="19" cy="19" r="5" fill="#1E6702"/>
          <defs>
            <linearGradient id="userPinGrad" x1="19" y1="2" x2="19" y2="48" gradientUnits="userSpaceOnUse">
              <stop stop-color="#2ca104"/>
              <stop offset="1" stop-color="#144a01"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <style>
        @keyframes mapPing {
          0% { transform: translateX(-50%) scale(0.6); opacity: 0.9; }
          75%, 100% { transform: translateX(-50%) scale(2.2); opacity: 0; }
        }
      </style>
    `,
    iconSize: [38, 50],
    iconAnchor: [19, 50],
    popupAnchor: [0, -50],
  });
};

// Create custom SVG DivIcons for different POI and competitor types
const createMarkerIcon = (type: string = "direct", index: number = 1) => {
  let primaryColor = "#DC2626"; // Crimson for direct
  let secondaryColor = "#991B1B";
  let innerSymbol = "D";

  if (type === "govt_hospital" || type === "govt_sector") {
    primaryColor = "#0284C7"; // Cyan / Royal Blue for Govt Hospital & Public Sector
    secondaryColor = "#0369A1";
    innerSymbol = "G";
  } else if (type === "pvt_hospital") {
    primaryColor = "#9333EA"; // Purple / Violet for Private Hospital
    secondaryColor = "#7E22CE";
    innerSymbol = "H";
  } else if (type === "indirect") {
    primaryColor = "#D97706"; // Amber for indirect
    secondaryColor = "#B45309";
    innerSymbol = "I";
  } else if (type === "market") {
    primaryColor = "#059669"; // Emerald for Mandi/Market
    secondaryColor = "#047857";
    innerSymbol = "M";
  } else if (type === "transport") {
    primaryColor = "#4F46E5"; // Indigo for Transport
    secondaryColor = "#3730A3";
    innerSymbol = "T";
  } else if (type === "supply") {
    primaryColor = "#0D9488"; // Teal for Supply Node
    secondaryColor = "#0F766E";
    innerSymbol = "S";
  } else if (type === "population") {
    primaryColor = "#0284C7"; // Sky Blue for Population
    secondaryColor = "#0369A1";
    innerSymbol = "P";
  }

  return L.divIcon({
    className: `custom-${type}-pin`,
    html: `
      <div style="position: relative; width: 32px; height: 42px; display: flex; align-items: center; justify-content: center;">
        <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.32));">
          <path d="M16 0C7.16344 0 0 7.16344 0 16C0 26.5 16 42 16 42C16 42 32 26.5 32 16C32 7.16344 24.8366 0 16 0Z" fill="${primaryColor}"/>
          <path d="M16 2C8.26801 2 2 8.26801 2 16C2 25.2 16 39.5 16 39.5C16 39.5 30 25.2 30 16C30 8.26801 23.732 2 16 2Z" fill="${secondaryColor}"/>
          <circle cx="16" cy="16" r="8" fill="#FFFFFF"/>
          <text x="16" y="19.5" text-anchor="middle" font-size="9.5" font-family="system-ui, -apple-system, sans-serif" font-weight="900" fill="${primaryColor}">${innerSymbol}</text>
        </svg>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

// Map invalidateSize handler to ensure canvas renders crisp without gray areas
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (_) {}
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Auto-recenter component when center coordinates or radius change
function MapRecenter({ center, radiusInKm = 5 }: { center: [number, number]; radiusInKm?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      const zoom = radiusInKm >= 20 ? 10 : radiusInKm >= 10 ? 11 : 12;
      map.setView(center, zoom, { animate: true });
      map.invalidateSize();
    }
  }, [center, radiusInKm, map]);
  return null;
}

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  category?: string;
  distanceKm?: number;
  type?: "user" | "competitor" | "direct" | "indirect" | "market" | "transport" | "supply" | "population" | "govt_hospital" | "pvt_hospital" | "govt_sector" | "pvt_sector" | string;
  sectorType?: "Govt / Public Sector" | "Private Sector" | string;
  ownership?: "Government" | "Private" | "Co-operative" | string;
  facilityType?: string;
  source?: string;
  pricing?: string;
  details?: string;
  businessImpact?: string;
}

interface RadiusMapProps {
  center: [number, number]; // [lat, lng]
  radiusInKm?: number;
  businessName?: string;
  locationLabel?: string;
  markers?: MapMarker[];
  showCatchmentCircles?: boolean;
  showLabels?: boolean;
  hideTopBadge?: boolean;
}

export const RadiusMap: React.FC<RadiusMapProps> = ({
  center,
  radiusInKm = 5,
  businessName = "Proposed Venture Location",
  locationLabel = "Selected Location",
  markers = [],
  showCatchmentCircles = true,
  showLabels = true,
  hideTopBadge = false,
}) => {
  const [isMounted, setIsMounted] = React.useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Validate center coordinates; fallback to India center if invalid
  const safeCenter: [number, number] =
    Array.isArray(center) && !isNaN(center[0]) && !isNaN(center[1]) && center[0] !== 0
      ? center
      : [20.5937, 78.9629];

  // Tile layer configuration utilizing user's OpenStreetMap key from .env:
  const osmApiKey = process.env.NEXT_PUBLIC_OPENSTREETMAP_API_KEY || "";
  const tileUrl = osmApiKey
    ? `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?api_key=${osmApiKey}`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const userPin = React.useMemo(() => {
    if (!isMounted) return undefined;
    return createUserPinIcon(businessName);
  }, [businessName, isMounted]);

  // Marker counts for dynamic legend
  const counts = React.useMemo(() => {
    let direct = 0;
    let indirect = 0;
    let govt = 0;
    let pvt = 0;
    let market = 0;
    let transport = 0;
    let supply = 0;
    let population = 0;

    markers.forEach((m) => {
      const t = m.type?.toLowerCase() || "direct";
      const isGovt =
        t === "govt_hospital" ||
        t === "govt_sector" ||
        m.sectorType?.toLowerCase().includes("govt") ||
        m.ownership?.toLowerCase().includes("gov") ||
        m.title?.toLowerCase().includes("government") ||
        m.title?.toLowerCase().includes("civil hospital") ||
        m.title?.toLowerCase().includes("community health");

      if (isGovt) govt++;
      else if (
        t === "pvt_hospital" ||
        t === "pvt_sector" ||
        m.sectorType?.toLowerCase().includes("private") ||
        m.ownership?.toLowerCase().includes("private")
      ) {
        pvt++;
      }

      if (t === "direct" || t === "competitor" || t === "pvt_hospital") direct++;
      else if (t === "indirect" || t === "govt_hospital" || t === "govt_sector") indirect++;
      else if (t === "market") market++;
      else if (t === "transport") transport++;
      else if (t === "supply") supply++;
      else if (t === "population") population++;
    });

    return { direct, indirect, govt, pvt, market, transport, supply, population, total: markers.length };
  }, [markers]);

  if (!isMounted || typeof window === "undefined" || !userPin) {
    return (
      <div className="w-full h-full min-h-[360px] bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
        <p className="text-xs font-semibold text-slate-500">Loading OpenStreetMap canvas...</p>
      </div>
    );
  }

  const initialZoom = radiusInKm >= 20 ? 10 : radiusInKm >= 10 ? 11 : 12;

  return (
    <div className="w-full h-full relative" style={{ minHeight: "360px" }}>
      <style>{`
        .vr-map-marker-tooltip {
          background: rgba(255, 255, 255, 0.98) !important;
          border: 1px solid rgba(203, 213, 225, 0.95) !important;
          border-radius: 9px !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15) !important;
          padding: 3px 6px !important;
          pointer-events: none !important;
          white-space: normal !important;
        }
        .vr-map-marker-tooltip::before {
          border-top-color: rgba(203, 213, 225, 0.95) !important;
        }
        .vr-user-tooltip {
          border: 1.5px solid #1E6702 !important;
          box-shadow: 0 4px 16px rgba(30, 103, 2, 0.28) !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 2px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
        }
      `}</style>

      {/* Floating Radius & Catchment Info Badge */}
      {!hideTopBadge && (
        <div className="hidden sm:flex absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-sm z-[400] pointer-events-auto items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1E6702] animate-pulse" />
          <span className="text-[11px] font-bold text-slate-800">
            {radiusInKm} km Radar Catchment
          </span>
          <span className="text-[10px] font-medium text-slate-500 border-l border-slate-200 pl-2">
            ~{Math.round(Math.PI * radiusInKm * radiusInKm)} km²
          </span>
        </div>
      )}

      <MapContainer
        center={safeCenter}
        zoom={initialZoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "360px", zIndex: 0 }}
        className="rounded-2xl overflow-hidden shadow-inner"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileUrl}
          maxZoom={19}
        />

        <MapResizer />
        <MapRecenter center={safeCenter} radiusInKm={radiusInKm} />

        {/* Catchment Rings: 5km Core, 10km Regional, 20km District */}
        {showCatchmentCircles && (
          <>
            {/* 5km Core Catchment Circle */}
            <Circle
              center={safeCenter}
              radius={5000}
              pathOptions={{
                color: radiusInKm === 5 ? "#1E6702" : "#16a34a",
                fillColor: "#1E6702",
                fillOpacity: radiusInKm === 5 ? 0.14 : 0.04,
                weight: radiusInKm === 5 ? 2.5 : 1.2,
                dashArray: radiusInKm === 5 ? undefined : "4, 6",
              }}
            />

            {/* 10km Regional Trade Circle */}
            {(radiusInKm >= 10 || showCatchmentCircles) && (
              <Circle
                center={safeCenter}
                radius={10000}
                pathOptions={{
                  color: radiusInKm === 10 ? "#1E6702" : "#2563eb",
                  fillColor: radiusInKm === 10 ? "#1E6702" : "#2563eb",
                  fillOpacity: radiusInKm === 10 ? 0.12 : 0.03,
                  weight: radiusInKm === 10 ? 2.5 : 1.2,
                  dashArray: radiusInKm === 10 ? undefined : "4, 8",
                }}
              />
            )}

            {/* 20km District Catchment Circle */}
            {(radiusInKm >= 20 || showCatchmentCircles) && (
              <Circle
                center={safeCenter}
                radius={20000}
                pathOptions={{
                  color: radiusInKm === 20 ? "#1E6702" : "#7c3aed",
                  fillColor: radiusInKm === 20 ? "#1E6702" : "#7c3aed",
                  fillOpacity: radiusInKm === 20 ? 0.10 : 0.02,
                  weight: radiusInKm === 20 ? 2.5 : 1,
                  dashArray: radiusInKm === 20 ? undefined : "3, 8",
                }}
              />
            )}
          </>
        )}

        {/* Main User Venture Marker - Distinctive Green Pin with Pulse and Label */}
        <Marker position={safeCenter} icon={userPin}>
          {showLabels && (
            <Tooltip
              permanent
              direction="top"
              offset={[0, -44]}
              opacity={1}
              className="vr-map-marker-tooltip vr-user-tooltip"
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "90px", maxWidth: "180px", textAlign: "center", lineHeight: "1.2" }}>
                <span
                  style={{
                    fontSize: "8.5px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "1px 6px",
                    borderRadius: "9999px",
                    backgroundColor: "#dcfce7",
                    color: "#15803d",
                    border: "1px solid #86efac",
                    marginBottom: "2px",
                  }}
                >
                  ★ Your Venture
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#0f172a",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {businessName}
                </span>
              </div>
            </Tooltip>
          )}
          <Popup>
            <div className="p-1 space-y-1.5 font-sans text-xs min-w-[210px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E6702] text-white font-bold text-[10px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Your Business Venture
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{businessName}</h4>
              <p className="text-slate-600 font-medium">{locationLabel}</p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex justify-between items-center">
                <span className="font-semibold text-emerald-800">Catchment: {radiusInKm} km</span>
                <span className="font-mono text-slate-400">
                  {safeCenter[0].toFixed(3)}°N, {safeCenter[1].toFixed(3)}°E
                </span>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Competitor & POI Markers with Explicit Type, Name & Distance Labels */}
        {markers.map((marker, idx) => {
          const rawType = marker.type?.toLowerCase() || "direct";
          const titleLower = marker.title?.toLowerCase() || "";
          const sectorLower = marker.sectorType?.toLowerCase() || "";
          const ownLower = marker.ownership?.toLowerCase() || "";

          const isGovt =
            rawType === "govt_hospital" ||
            rawType === "govt_sector" ||
            sectorLower.includes("govt") ||
            ownLower.includes("gov") ||
            titleLower.includes("government hospital") ||
            titleLower.includes("civil hospital") ||
            titleLower.includes("community health") ||
            titleLower.includes("primary health") ||
            titleLower.includes("phc") ||
            titleLower.includes("chc") ||
            titleLower.includes("ayush") ||
            titleLower.includes("esic");

          const isHospital =
            rawType.includes("hospital") ||
            titleLower.includes("hospital") ||
            titleLower.includes("nursing home") ||
            titleLower.includes("clinic") ||
            titleLower.includes("health") ||
            (marker.facilityType || "").toLowerCase().includes("hospital");

          const isGovtHospital = isGovt && isHospital;
          const isPvtHospital = !isGovt && isHospital;

          const isIndirect = rawType === "indirect" || (isGovt && rawType !== "direct");
          const isMarket = rawType === "market";
          const isTransport = rawType === "transport";
          const isSupply = rawType === "supply";
          const isPopulation = rawType === "population";

          let badgeBg = isGovtHospital
            ? "#e0f2fe"
            : isPvtHospital
            ? "#fae8ff"
            : isGovt
            ? "#ecfdf5"
            : isIndirect
            ? "#fef3c7"
            : isMarket
            ? "#dbeafe"
            : isTransport
            ? "#e0e7ff"
            : isSupply
            ? "#ccfbf1"
            : isPopulation
            ? "#e0f2fe"
            : "#fee2e2";

          let badgeColor = isGovtHospital
            ? "#0369a1"
            : isPvtHospital
            ? "#86198f"
            : isGovt
            ? "#065f46"
            : isIndirect
            ? "#92400e"
            : isMarket
            ? "#1e40af"
            : isTransport
            ? "#3730a3"
            : isSupply
            ? "#115e59"
            : isPopulation
            ? "#075985"
            : "#991b1b";

          let badgeBorder = isGovtHospital
            ? "#7dd3fc"
            : isPvtHospital
            ? "#f0abfc"
            : isGovt
            ? "#6ee7b7"
            : isIndirect
            ? "#fcd34d"
            : isMarket
            ? "#93c5fd"
            : isTransport
            ? "#a5b4fc"
            : isSupply
            ? "#5eead4"
            : isPopulation
            ? "#7dd3fc"
            : "#fca5a5";

          let badgeText = isGovtHospital
            ? "Govt Hospital"
            : isPvtHospital
            ? "Pvt Hospital"
            : isGovt
            ? "Govt Sector"
            : isIndirect
            ? "Indirect"
            : isMarket
            ? "APMC Mandi"
            : isTransport
            ? "Transport"
            : isSupply
            ? "Agro Supply"
            : isPopulation
            ? "Population"
            : "Direct";

          const iconType = isGovtHospital
            ? "govt_hospital"
            : isPvtHospital
            ? "pvt_hospital"
            : isGovt
            ? "govt_sector"
            : rawType;

          const icon = marker.type === "user" ? userPin : createMarkerIcon(iconType, idx + 1);

          return (
            <Marker
              key={marker.id || `marker-${idx}`}
              position={marker.position}
              icon={icon}
            >
              {/* Permanent on-map label showing competitor name, distance & sector badge */}
              {showLabels && (
                <Tooltip
                  permanent
                  direction="top"
                  offset={[0, -28]}
                  opacity={1}
                  className="vr-map-marker-tooltip"
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px", maxWidth: "155px", textAlign: "center", lineHeight: "1.25", padding: "1px 2px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", width: "100%", marginBottom: "2px" }}>
                      <span
                        style={{
                          fontSize: "8px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          padding: "1px 5px",
                          borderRadius: "9999px",
                          lineHeight: "1.2",
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          border: `1px solid ${badgeBorder}`,
                        }}
                      >
                        {badgeText}
                      </span>
                      {marker.distanceKm != null && (
                        <span style={{ fontSize: "8.5px", fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
                          • {marker.distanceKm.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#0f172a",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: "1.25",
                      }}
                      title={marker.title}
                    >
                      {marker.title}
                    </span>
                  </div>
                </Tooltip>
              )}

              {/* Detailed interactive popup on click */}
              <Popup>
                <div className="p-1.5 space-y-2 font-sans text-xs min-w-[240px] max-w-[280px]">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      style={{
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${badgeBorder}`,
                      }}
                      className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider"
                    >
                      {badgeText} {isMarket || isTransport || isSupply || isPopulation ? "Node" : "Competitor"}
                    </span>
                    {marker.distanceKm != null && (
                      <span className="font-extrabold text-emerald-800 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {marker.distanceKm.toFixed(1)} km away
                      </span>
                    )}
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm leading-snug">{marker.title}</h5>

                  <div className="flex flex-wrap gap-1.5 text-[10.5px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 border border-slate-200">
                      {isGovt ? "🏛️ Govt / Public Sector" : "🏥 Private Sector"}
                    </span>
                    {marker.category && (
                      <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100">
                        {marker.category}
                      </span>
                    )}
                  </div>

                  {marker.source && (
                    <p className="text-[10px] text-slate-500">
                      Source: <span className="font-semibold text-slate-700">{marker.source}</span>
                    </p>
                  )}

                  {marker.pricing && (
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-800 font-semibold text-[11px] border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Observed Pricing:</span>
                      <span className="text-emerald-800 font-bold">{marker.pricing}</span>
                    </div>
                  )}

                  {(marker.businessImpact || marker.details) && (
                    <div className="p-2 bg-amber-50/80 rounded-lg text-[10.5px] border border-amber-200/90 leading-relaxed text-amber-950">
                      <strong className="text-amber-900 block font-bold text-[10.5px] mb-0.5">
                        💼 Effect on Business Analysis:
                      </strong>
                      {marker.businessImpact || marker.details}
                    </div>
                  )}

                  <div className="pt-1.5 text-[10px] text-slate-400 font-mono border-t border-slate-100 flex justify-between">
                    <span>Coordinates:</span>
                    <span>{marker.position[0].toFixed(4)}°N, {marker.position[1].toFixed(4)}°E</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Dynamic Map Legend Overlay */}
      <div className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-md border border-slate-200/90 z-[400] text-[10px] sm:text-[11px] flex flex-wrap items-center gap-1.5 sm:gap-2.5 max-w-[calc(100%-20px)] sm:max-w-md pointer-events-auto">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1E6702] border border-white shadow-xs inline-block" />
          <span className="font-semibold text-slate-700">Your Venture</span>
        </div>

        {counts.govt > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] border border-white shadow-xs inline-block" />
            <span className="font-semibold text-sky-700">Govt ({counts.govt})</span>
          </div>
        )}

        {counts.pvt > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA] border border-white shadow-xs inline-block" />
            <span className="font-semibold text-purple-700">Pvt ({counts.pvt})</span>
          </div>
        )}

        {counts.direct > 0 && counts.govt === 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] border border-white shadow-xs inline-block" />
            <span className="font-semibold text-red-700">Direct ({counts.direct})</span>
          </div>
        )}

        {counts.indirect > 0 && counts.govt === 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] border border-white shadow-xs inline-block" />
            <span className="font-semibold text-amber-700">Indirect ({counts.indirect})</span>
          </div>
        )}

        {counts.market > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669] border border-white shadow-xs inline-block" />
            <span className="font-semibold text-emerald-700">Mandi ({counts.market})</span>
          </div>
        )}

        {counts.transport > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] border border-white shadow-xs inline-block" />
            <span className="font-semibold text-indigo-700">Transport ({counts.transport})</span>
          </div>
        )}

        {counts.supply > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] border border-white shadow-xs inline-block" />
            <span className="font-semibold text-teal-700">Supply ({counts.supply})</span>
          </div>
        )}

        {counts.population > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] border border-white shadow-xs inline-block" />
            <span className="font-semibold text-sky-700">Pop. ({counts.population})</span>
          </div>
        )}

        <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5">
          <span className="w-2 h-2 rounded-full border border-emerald-600 border-dashed inline-block" />
          <span className="text-slate-500 font-medium">{radiusInKm}km Catchment</span>
        </div>
      </div>
    </div>
  );
};

export default RadiusMap;
