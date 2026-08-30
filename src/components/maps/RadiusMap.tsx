"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issues in Next.js
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RadiusMapProps {
  center: [number, number]; // [lat, lng]
  radiusInKm: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    type?: string;
  }>;
}

export const RadiusMap: React.FC<RadiusMapProps> = ({ center, radiusInKm, markers = [] }) => {
  // We don't want the map to accidentally re-mount often, but Next.js dynamic import handles CSR.

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      className="rounded-xl overflow-hidden"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {/* Visual Radius Overlay */}
      <Circle
        center={center}
        radius={radiusInKm * 1000} // Leaflet uses meters
        pathOptions={{ color: "#1b4332", fillColor: "#2d6a4f", fillOpacity: 0.1, weight: 2 }}
      />

      {/* Main Center Marker */}
      <Marker position={center} icon={customIcon}>
        <Popup>
          <strong>Proposed Business Location</strong>
          <br />
          Radius: {radiusInKm} km
        </Popup>
      </Marker>

      {/* Additional Map Markers (Competitors, Markets, etc.) */}
      {markers.map((marker) => (
        <Marker key={marker.id} position={marker.position} icon={customIcon}>
          <Popup>{marker.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default RadiusMap;
