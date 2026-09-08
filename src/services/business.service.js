import {
  createBusiness,
  findBusinessesByUserId,
  findBusinessByIdAndUserId,
  updateBusinessByIdAndUserId,
  deleteBusinessByIdAndUserId,
} from "@/repositories/business.repository";

import {
  findBusinessCategoryById,
} from "@/repositories/business-category.repository";

import {
  findLocationByHierarchy,
  findLocationWithParents,
} from "@/repositories/location.repository";

import {
  BadRequestError,
  NotFoundError,
} from "@/errors/http-error";

import {
  buildLocationResponse,
} from "@/utils/location.mapper";

import {
  mapBusinessCategory,
} from "@/utils/business.mapper";

async function mapBusinessResponse(business) {
  const fullLocation =
    await findLocationWithParents(
      business.locationId
    );

  return {
    id: business.id,

    category:
      mapBusinessCategory(
        business.category
      ),

    location:
      buildLocationResponse(
        fullLocation
      ),

    name: business.name,

    description:
      business.description,

    availableMargin:
      Number(
        business.availableMargin
      ),

    existingResources:
      business.existingResources,

    expectedRevenue:
      Number(
        business.expectedRevenue
      ),

    status:
      business.status,

    createdAt:
      business.createdAt,

    updatedAt:
      business.updatedAt,
  };
}


async function validateCategory(categoryId) {
  const category =
    await findBusinessCategoryById(
      categoryId
    );

  if (!category) {
    throw new BadRequestError(
      "Business category not found"
    );
  }

  if (!category.isActive) {
    throw new BadRequestError(
      "Business category is inactive"
    );
  }

  return category;
}


async function resolveLocation(data) {
  const location =
    await findLocationByHierarchy({
      state: data.state,
      district: data.district,
      block: data.block,
      village: data.village,
    });

  if (!location) {
    throw new BadRequestError(
      "Invalid location hierarchy"
    );
  }

  return location;
}


export async function createMyBusiness(
  user,
  data
) {
  await validateCategory(
    data.categoryId
  );

  const location =
    await resolveLocation(data);

  const business =
    await createBusiness({
      userId: user.id,

      categoryId:
        data.categoryId,

      locationId:
        location.id,

      name:
        data.name ?? null,

      description:
        data.description ?? null,

      availableMargin:
        data.availableMargin,

      existingResources:
        data.existingResources ?? null,

      expectedRevenue:
        data.expectedRevenue,
    });

  return mapBusinessResponse(business);
}


export async function getMyBusinesses(
  user,
  query = {}
) {
  const page =
    Math.max(
      1,
      Number.parseInt(query.page, 10) || 1
    );

  const limit =
    Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(query.limit, 10) || 10
      )
    );

  const search =
    typeof query.search === "string"
      ? query.search.trim()
      : undefined;

  const sortBy =
    typeof query.sortBy === "string"
      ? query.sortBy
      : "createdAt";

  const sortOrder =
    query.sortOrder === "asc"
      ? "asc"
      : "desc";

  const {
    businesses,
    total,
  } = await findBusinessesByUserId({
    userId: user.id,

    page,
    limit,

    status: query.status,
    categoryId: query.categoryId,

    search,

    sortBy,
    sortOrder,
  });

  const mappedBusinesses =
    await Promise.all(
      businesses.map(
        mapBusinessResponse
      )
    );

  const totalPages =
    Math.ceil(total / limit);

  return {
    businesses: mappedBusinesses,

    pagination: {
      page,
      limit,
      total,
      totalPages,

      hasNextPage:
        page < totalPages,

      hasPreviousPage:
        page > 1,
    },
  };
}

export async function getMyBusinessById(
  user,
  businessId
) {
  const business =
    await findBusinessByIdAndUserId({
      businessId,
      userId: user.id,
    });

  if (!business) {
    throw new NotFoundError(
      "Business not found"
    );
  }

  return mapBusinessResponse(business);
}


export async function updateMyBusiness(
  user,
  businessId,
  data
) {
  await validateCategory(
    data.categoryId
  );

  const location =
    await resolveLocation(data);

  const business =
    await updateBusinessByIdAndUserId({
      businessId,
      userId: user.id,

      data: {
        categoryId:
          data.categoryId,

        locationId:
          location.id,

        name:
          data.name ?? null,

        description:
          data.description ?? null,

        availableMargin:
          data.availableMargin,

        existingResources:
          data.existingResources ?? null,

        expectedRevenue:
          data.expectedRevenue,
      },
    });

  if (!business) {
    throw new NotFoundError(
      "Business not found"
    );
  }

  return mapBusinessResponse(business);
}


export async function deleteMyBusiness(
  user,
  businessId
) {
  const business =
    await deleteBusinessByIdAndUserId({
      businessId,
      userId: user.id,
    });

  if (!business) {
    throw new NotFoundError(
      "Business not found"
    );
  }

  return {
    id: business.id,
  };
}