import { registerUser } from "@/services/auth.service";
import {loginUser} from "@/services/auth.service";

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