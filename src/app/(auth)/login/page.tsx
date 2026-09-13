"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { loginSchema, LoginFormValues } from "@/features/auth/schemas/authSchema";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { motion, Variants } from "framer-motion";
import { TextEffect } from "@/components/ui/text-effect";
import { useAuthStore } from "@/stores/useAuthStore";
import { authApi } from "@/features/auth/api/authApi";

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="flex w-full min-h-screen items-center justify-center bg-[#FFFBE7]">
        <div className="w-6 h-6 border-2 border-[#1E6702]/30 border-t-[#1E6702] rounded-full animate-spin" />
      </div>
    }>
      <LoginPageContent />
    </React.Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const loginAction = useAuthStore((state) => state.login);
  const mockUser = useAuthStore((state) => state.user);

  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    setIsSubmitting(true);
    try {
      const res: any = await authApi.login(data);
      
      const session = res?.data?.session || res?.data?.data?.session || res?.session;
      const backendUser = res?.data?.user || res?.data?.data?.user || res?.user;
      const token = session?.access_token || "mock-token-xyz-123";
      
      const rawFullName = backendUser?.user_metadata?.full_name || backendUser?.user_metadata?.name || backendUser?.user_metadata?.username;
      const formattedEmailName = (backendUser?.email || data.email || "").split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      const resolvedName = (rawFullName && rawFullName.trim()) || (formattedEmailName && formattedEmailName.trim()) || "Entrepreneur";

      if (typeof window !== "undefined") {
        localStorage.setItem("ventureroot_user_name", resolvedName);
        localStorage.setItem("ventureroot_user_email", backendUser?.email || data.email);
        localStorage.setItem("ventureroot_user_id", backendUser?.id || "");
      }

      const authUser = {
        id: backendUser?.id || "user-" + Date.now(),
        name: resolvedName,
        email: backendUser?.email || data.email,
        roleLabel: backendUser?.user_metadata?.role || "Entrepreneur",
      };

      loginAction(token, authUser);
      setIsSubmitting(false);
      
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      // If the backend is completely unreachable (Network Error) during frontend-only dev,
      // we gracefully fall back to the mock token to allow UI testing to continue.
      if (error?.message === "Network Error") {
        console.warn("Backend not running. Proceeding with mock login for UI testing.");
        const fallbackEmailName = (data.email || "").split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Entrepreneur";
        const fallbackUser = {
          id: "user-" + (data.email ? data.email.replace(/[^a-zA-Z0-9]/g, "_") : "guest"),
          name: fallbackEmailName,
          email: data.email || "entrepreneur@ventureroot.in",
          roleLabel: "Entrepreneur",
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("ventureroot_user_name", fallbackEmailName);
          localStorage.setItem("ventureroot_user_email", fallbackUser.email);
          localStorage.setItem("ventureroot_user_id", fallbackUser.id);
        }
        loginAction("mock-token-xyz-123", fallbackUser);
        setIsSubmitting(false);
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push("/dashboard");
        }
      } else {
        setGlobalError(error?.message || "Invalid credentials or server error");
        setIsSubmitting(false);
      }
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const isNotRegistered = globalError?.toLowerCase().includes("not registered");
  const isIncorrectPassword = globalError?.toLowerCase().includes("incorrect password");

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-[#FFFBE7]">

      {/* ── LEFT PANEL ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-[40%] lg:w-[45%] h-[240px] md:h-screen md:sticky md:top-0 relative flex flex-col overflow-hidden"
      >
        <img
          src="/login-bg-2.jpg"
          alt="Rural Landscape"
          className="absolute inset-0 w-full h-full object-cover object-[center_40%]"
        />
        {/* Subtle text gradient overlay: darkens top left slightly for text contrast without ruining the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#200813]/40 via-transparent to-transparent md:bg-gradient-to-br md:from-[#200813]/50 md:via-transparent" />

        {/* Brand & Message Container (hidden on mobile, visible on tablet+) */}
        <div className="relative z-10 p-8 pt-10 md:pt-12 h-full hidden md:block">

          <Link href="/" className="bg-[#FFFBE7] w-max h-14 px-6 rounded-xl flex items-center justify-center shadow-xl border border-black/5 hover:scale-[1.02] transition-transform block relative z-20">
            <img src="/logo-wordmark.png" alt="VentureRoot" className="h-8 w-auto object-contain mix-blend-multiply" />
          </Link>

          <div className="absolute inset-0 flex flex-col justify-center p-8 pointer-events-none z-10">
            <div className="max-w-[380px]">
              <h2 className="font-heading text-[28px] font-normal italic text-[#FFFBE7] leading-[1.15] drop-shadow-sm">
                <TextEffect per='char' preset='fade'>
                  Grow your local business with clarity.
                </TextEffect>
              </h2>
            </div>
          </div>

        </div>

        {/* Mobile simple brand overlay */}
        <div className="relative z-10 p-6 flex flex-col justify-end h-full md:hidden">
          <Link href="/" className="bg-[#FFFBE7] w-max h-12 px-5 rounded-xl flex items-center justify-center shadow-lg border border-black/5 mb-3 active:scale-[0.98] transition-transform block">
            <img src="/logo-wordmark.png" alt="VentureRoot" className="h-6 w-auto object-contain mix-blend-multiply" />
          </Link>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full md:w-[60%] lg:w-[55%] flex flex-col min-h-screen">
        <div className="p-6 md:p-8 flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-8 md:text-left"
            >
              <h1 className="font-heading text-[32px] font-medium text-[#200813]">
                Welcome back
              </h1>
              <p className="font-sans text-[14px] text-[#200813]/60 mt-2 font-normal">
                Log in to VentureRoot to continue your journey.
              </p>
            </motion.div>

            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-2xl border flex flex-col gap-2.5 ${
                  isNotRegistered
                    ? "bg-amber-50/90 border-amber-300 text-amber-950"
                    : isIncorrectPassword
                    ? "bg-red-50/90 border-red-300 text-red-950"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                    isNotRegistered ? "text-amber-600" : "text-red-600"
                  }`} />
                  <div className="flex-1">
                    <p className="font-sans font-bold text-[14px] leading-tight">
                      {isNotRegistered
                        ? "You are not registered"
                        : isIncorrectPassword
                        ? "Incorrect password"
                        : "Login failed"}
                    </p>
                    <p className="font-sans text-[13px] mt-1 text-slate-700 leading-relaxed">
                      {isNotRegistered
                        ? "We couldn't find an existing account with this email address. Please create a new account to get started."
                        : globalError}
                    </p>
                  </div>
                </div>

                {isNotRegistered && (
                  <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                    <span className="text-xs text-amber-900 font-medium">Ready to join?</span>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E6702] hover:bg-[#2b8a07] text-white font-sans text-xs font-bold transition-all shadow-sm"
                    >
                      Create Account &rarr;
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <motion.div variants={itemVariants}>
                <label className="block font-sans text-[14px] font-medium text-[#200813] mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl bg-white border ${errors.email ? "border-red-300 focus:ring-red-200" : "border-[#200813]/10 focus:ring-[#1E6702]/20 focus:border-[#1E6702]"
                    } p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 text-[#200813] font-normal shadow-sm`}
                />
                {errors.email && (
                  <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.email.message}</p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block font-sans text-[14px] font-medium text-[#200813] mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    className={`w-full rounded-xl bg-white border ${errors.password ? "border-red-300 focus:ring-red-200" : "border-[#200813]/10 focus:ring-[#1E6702]/20 focus:border-[#1E6702]"
                      } p-3.5 pr-12 font-sans text-[14px] transition-all outline-none focus:ring-4 text-[#200813] font-normal shadow-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#200813]/40 hover:text-[#200813] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.password.message}</p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="w-4 h-4 rounded border-[#200813]/20 text-[#1E6702] focus:ring-[#1E6702] bg-white transition-colors cursor-pointer"
                  />
                  <span className="font-sans text-[14px] font-normal text-[#200813]/70 group-hover:text-[#200813] transition-colors">Remember me</span>
                </label>
                <Link href="/login" className="font-sans text-[14px] font-medium text-[#1E6702] hover:text-[#1E6702]/80 transition-colors">
                  Forgot password?
                </Link>
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 mt-2 rounded-xl bg-[#1E6702] text-white font-sans text-[14px] font-medium hover:bg-[#154a01] transition-all shadow-[0_4px_14px_rgba(30,103,2,0.25)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Log In"
                )}
              </motion.button>

              <motion.div variants={itemVariants} className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-[#200813]/10" />
                <span className="font-sans text-[12px] font-medium text-[#200813]/40 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-[#200813]/10" />
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <button type="button" className="w-full py-3 rounded-xl bg-white border border-[#200813]/10 font-sans text-[14px] font-medium text-[#200813] hover:bg-[#200813]/5 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path fill="none" d="M1 1h22v22H1z" /></svg>
                  Continue with Google
                </button>
                <button type="button" className="w-full py-3 rounded-xl bg-white border border-[#200813]/10 font-sans text-[14px] font-medium text-[#200813] hover:bg-[#200813]/5 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-[#1E6702]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Continue with Email OTP
                </button>
              </motion.div>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center md:text-left font-sans text-[14px] text-[#200813]/60 mt-8 font-normal"
            >
              Don't have an account? <Link href="/register" className="font-medium text-[#1E6702] hover:text-[#154a01] transition-colors ml-1">
                Create one
              </Link>
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}
