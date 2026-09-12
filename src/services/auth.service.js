import { supabase } from "@/lib/supabase";
import { mapAuthError } from "@/errors/auth-error";
import { upsertProfile } from "@/repositories/profile.repository";

function splitFullName(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return { firstName: "Entrepreneur", lastName: null };
  }
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "Entrepreneur",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

export async function registerUser({
  email,
  password,
  fullName,
}) {
  const options = fullName
    ? {
        data: {
          full_name: fullName,
          name: fullName,
        },
      }
    : undefined;

  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
      options,
    });

  if (error) {
    throw mapAuthError(error);
  }

  if (data?.user?.id && fullName) {
    try {
      const { firstName, lastName } = splitFullName(fullName);
      await upsertProfile({
        userId: data.user.id,
        firstName: firstName || "Entrepreneur",
        lastName,
      });
    } catch (profileErr) {
      console.warn("[auth.service] Initial profile creation notice:", profileErr?.message);
    }
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



