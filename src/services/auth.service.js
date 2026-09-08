import { supabase } from "@/lib/supabase";
import { mapAuthError } from "@/errors/auth-error";

export async function registerUser({
  email,
  password,
}) {
  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
    });

  if (error) {
    throw mapAuthError(error);
  }

  return data;
}

export async function loginUser({
  email,
  password,
}) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw mapAuthError(error);
  }

  return data;
}

export async function getCurrentUser(accessToken) {
  const { data, error } =
    await supabase.auth.getUser(accessToken);

  if (error || !data?.user) {
    throw mapAuthError(error);
  }

  return data.user;
}

export async function refreshUserSession(
  refreshToken
) {
  const { data, error } =
    await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

  if (error) {
    throw mapAuthError(error);
  }

  return data;
}



