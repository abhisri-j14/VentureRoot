import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { mapAuthError } from "@/errors/auth-error";
import { UnauthorizedError, ConflictError } from "@/errors/http-error";

export async function checkUserRegistered(email) {
  if (!email) return false;
  try {
    const normalized = email.trim().toLowerCase();
    const rows = await prisma.$queryRawUnsafe(
      "SELECT id FROM auth.users WHERE LOWER(email) = LOWER($1) LIMIT 1;",
      normalized
    );
    return Array.isArray(rows) && rows.length > 0;
  } catch (err) {
    console.warn("[auth.service] Direct auth.users check warning:", err.message);
    return false;
  }
}

export async function registerUser({
  email,
  password,
  fullName,
  name,
  username,
  phone,
  location,
}) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const chosenName = (fullName || name || (email ? email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Entrepreneur")).trim();

  // Check if user already exists in database
  try {
    const exists = await checkUserRegistered(normalizedEmail);
    if (exists) {
      throw new ConflictError("You are already registered. Please log in.");
    }
  } catch (err) {
    if (err instanceof ConflictError) throw err;
  }

  const { data, error } =
    await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: chosenName,
          name: chosenName,
          username: username || chosenName.toLowerCase().replace(/\s+/g, "_"),
          phone: phone || null,
        },
      },
    });

  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      throw new ConflictError("You are already registered. Please log in.");
    }
    throw mapAuthError(error);
  }

  // Automatically initialize a Prisma Profile so the user has immediate profile data
  if (data?.user?.id) {
    try {
      const parts = chosenName.split(/\s+/);
      const firstName = parts[0] || "Entrepreneur";
      const lastName = parts.slice(1).join(" ") || null;

      await prisma.profile.upsert({
        where: { userId: data.user.id },
        update: {
          firstName,
          lastName,
          phone: phone || null,
        },
        create: {
          userId: data.user.id,
          firstName,
          lastName,
          phone: phone || null,
          availableCapital: 100000,
          income: 25000,
          businessExperience: "1-3 years",
          skills: ["Business Operations", "Market Intelligence"],
          education: "Graduate / Vocational",
        },
      });
    } catch (profileErr) {
      console.warn("[auth.service] Initial profile creation warning:", profileErr.message);
    }
  }

  return data;
}

export async function loginUser({
  email,
  password,
}) {
  const normalizedEmail = (email || "").trim().toLowerCase();

  // 1. First check if the email exists in auth.users
  try {
    const exists = await checkUserRegistered(normalizedEmail);
    if (!exists) {
      throw new UnauthorizedError("You are not registered. Please create an account first.");
    }
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
  }

  // 2. Perform Supabase authentication
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

  if (error) {
    if (error.code === "invalid_credentials" || error.message?.toLowerCase().includes("invalid login credentials")) {
      throw new UnauthorizedError("Incorrect password. Please try again.");
    }
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



