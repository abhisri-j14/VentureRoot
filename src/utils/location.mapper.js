import { resolveCoordinatesForLocation } from "../services/location-search.service.js";

export function buildLocationResponse(location) {
  if (!location) {
    return null;
  }

  const result = {
    state: null,
    district: null,
    block: null,
    subdistrict: null,
    village: null,
    lat: null,
    lon: null,
    latitude: null,
    longitude: null,
    formatted: null,
  };

  let current = location;
  let rawLat = null;
  let rawLon = null;

  while (current) {
    if (rawLat === null && current.latitude !== undefined && current.latitude !== null) {
      rawLat = Number(current.latitude);
    }
    if (rawLon === null && current.longitude !== undefined && current.longitude !== null) {
      rawLon = Number(current.longitude);
    }

    switch (current.type) {
      case "STATE":
        result.state = current.name;
        break;

      case "DISTRICT":
        result.district = current.name;
        break;

      case "BLOCK":
        result.block = current.name;
        result.subdistrict = current.name;
        break;

      case "VILLAGE":
        result.village = current.name;
        break;
    }

    current = current.parent;
  }

  // Hierarchically resolve exact coordinates for any registered location
  const resolved = resolveCoordinatesForLocation({
    state: result.state,
    district: result.district,
    block: result.block,
    village: result.village,
    latitude: rawLat,
    longitude: rawLon,
  });

  result.lat = resolved.lat;
  result.lon = resolved.lon;
  result.latitude = resolved.lat;
  result.longitude = resolved.lon;
  result.formatted = resolved.label;

  return result;
}