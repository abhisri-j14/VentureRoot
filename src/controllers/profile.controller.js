import {
  getMyProfile,
  upsertMyProfile,
} from "@/services/profile.service";


export async function getProfile(user) {
  const data =
    await getMyProfile(user);

  return {
    message:
      "Profile fetched successfully",

    data,
  };
}


export async function updateProfile(
  user,
  validatedData
) {
  const data =
    await upsertMyProfile(
      user,
      validatedData
    );

  return {
    message:
      "Profile updated successfully",

    data,
  };
}