import { registerUser } from "@/services/auth.service";

export async function register(data) {
  const result = await registerUser(data);

  return {
    message: "Registration successful",
    data: result,
  };
}