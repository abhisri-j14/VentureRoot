import {
  getStates,
  getDistricts,
  getBlocks,
  getVillages,
  searchLocationData,
  getLocationById,
} from "@/services/location.service";


export async function getStatesController() {
  const locations =
    await getStates();

  return {
    message:
      "States fetched successfully",

    data: {
      locations,
    },
  };
}


export async function getDistrictsController(
  stateId
) {
  const locations =
    await getDistricts(
      stateId
    );

  return {
    message:
      "Districts fetched successfully",

    data: {
      locations,
    },
  };
}


export async function getBlocksController(
  districtId
) {
  const locations =
    await getBlocks(
      districtId
    );

  return {
    message:
      "Blocks fetched successfully",

    data: {
      locations,
    },
  };
}


export async function getVillagesController(
  blockId
) {
  const locations =
    await getVillages(
      blockId
    );

  return {
    message:
      "Villages fetched successfully",

    data: {
      locations,
    },
  };
}


export async function searchLocationsController(
  query
) {
  const locations =
    await searchLocationData({
      query: query.q,
      limit: query.limit,
    });

  return {
    message:
      "Locations fetched successfully",

    data: {
      locations,
    },
  };
}


export async function getLocationController(
  locationId
) {
  const location =
    await getLocationById(
      locationId
    );

  return {
    message:
      "Location fetched successfully",

    data: {
      location,
    },
  };
}