export function buildLocationResponse(location) {
  if (!location) {
    return null;
  }

  const result = {
    state: null,
    district: null,
    block: null,
    village: null,
  };

  let current = location;

  while (current) {
    switch (current.type) {
      case "STATE":
        result.state = current.name;
        break;

      case "DISTRICT":
        result.district = current.name;
        break;

      case "BLOCK":
        result.block = current.name;
        break;

      case "VILLAGE":
        result.village = current.name;
        break;
    }

    current = current.parent;
  }

  return result;
}