import {
  findStates,
  findDistrictsByStateId,
  findBlocksByDistrictId,
  findVillagesByBlockId,
  searchLocations,
  findLocationById,
  findLocationWithParents,
} from "@/repositories/location.repository";

import {
  BadRequestError,
  NotFoundError,
} from "@/errors/http-error";

import {
  buildLocationResponse,
} from "@/utils/location.mapper";


function mapLocation(location) {
  return {
    id: location.id,
    name: location.name,
    code: location.code,
    type: location.type,
  };
}


async function validateParentLocation({
  locationId,
  expectedType,
}) {
  const location =
    await findLocationById(locationId);

  if (!location) {
    throw new NotFoundError(
      "Parent location not found"
    );
  }

  if (location.type !== expectedType) {
    throw new BadRequestError(
      `Location must be of type ${expectedType}`
    );
  }

  return location;
}


export async function getStates() {
  const states =
    await findStates();

  return states.map(mapLocation);
}


export async function getDistricts(
  stateId
) {
  await validateParentLocation({
    locationId: stateId,
    expectedType: "STATE",
  });

  const districts =
    await findDistrictsByStateId(
      stateId
    );

  return districts.map(mapLocation);
}


export async function getBlocks(
  districtId
) {
  await validateParentLocation({
    locationId: districtId,
    expectedType: "DISTRICT",
  });

  const blocks =
    await findBlocksByDistrictId(
      districtId
    );

  return blocks.map(mapLocation);
}


export async function getVillages(
  blockId
) {
  await validateParentLocation({
    locationId: blockId,
    expectedType: "BLOCK",
  });

  const villages =
    await findVillagesByBlockId(
      blockId
    );

  return villages.map(mapLocation);
}


export async function searchLocationData({
  query,
  limit,
}) {
  const locations =
    await searchLocations({
      query,
      limit,
    });

  return locations.map(
    mapLocation
  );
}


export async function getLocationById(
  locationId
) {
  const location =
    await findLocationWithParents(
      locationId
    );

  if (!location) {
    throw new NotFoundError(
      "Location not found"
    );
  }

  return {
    id: location.id,
    name: location.name,
    code: location.code,
    type: location.type,

    latitude:
      location.latitude !== null
        ? Number(location.latitude)
        : null,

    longitude:
      location.longitude !== null
        ? Number(location.longitude)
        : null,

    hierarchy:
      buildLocationResponse(
        location
      ),
  };
}