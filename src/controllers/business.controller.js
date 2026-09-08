import {
  createMyBusiness,
  getMyBusinesses,
  getMyBusinessById,
  updateMyBusiness,
  deleteMyBusiness,
} from "@/services/business.service";


export async function createBusinessController(
  user,
  validatedData
) {
  const business =
    await createMyBusiness(
      user,
      validatedData
    );

  return {
    message:
      "Business created successfully",

    data: {
      business,
    },
  };
}



export async function getBusinessesController(
  user,
  query
) {
  const result =
    await getMyBusinesses(
      user,
      query
    );

  return {
    message:
      "Businesses fetched successfully",

    data: result,
  };
}

export const getBusinessController = getBusinessesController;

export async function getBusinessByIdController(
  user,
  businessId
) {
  const business =
    await getMyBusinessById(
      user,
      businessId
    );

  return {
    message:
      "Business fetched successfully",

    data: {
      business,
    },
  };
}


export async function updateBusinessController(
  user,
  businessId,
  validatedData
) {
  const business =
    await updateMyBusiness(
      user,
      businessId,
      validatedData
    );

  return {
    message:
      "Business updated successfully",

    data: {
      business,
    },
  };
}


export async function deleteBusinessController(
  user,
  businessId
) {
  const result =
    await deleteMyBusiness(
      user,
      businessId
    );

  return {
    message:
      "Business deleted successfully",

    data: result,
  };
}