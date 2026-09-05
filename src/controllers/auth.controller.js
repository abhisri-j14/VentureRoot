import { registerUser } from "@/services/auth.service";
import {loginUser} from "@/services/auth.service";
import { getCurrentUser } from "@/services/auth.service";
import {refreshUserSession} from "@/services/auth.service";

export async function register(data) {
  const result = await registerUser(data);

  return {
    message: "Registration successful",
    data: result,
  };
}
export async function login(data) {
  const result = await loginUser(data);

  return {
    message: "Login successful",
    data: result,
  };
}
export async function me(accessToken) {
  const user = await getCurrentUser(accessToken);

  return {
    message: "Current user fetched successfully",
    data: {
      user,
    },
  };
}
export async function refresh(refreshToken) {
  const result = await refreshUserSession(refreshToken);

  return {
    message: "Session refreshed successfully",
    data: result,
  };
}