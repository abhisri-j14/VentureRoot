import { supabase } from "@/lib/supabase";
// register endpoint
export async function registerUser({ email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}
// login endpoint
export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}
//me endpoint
export async function getCurrentUser(accessToken) {
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error) {
    throw error;
  }

  return data.user;
}


