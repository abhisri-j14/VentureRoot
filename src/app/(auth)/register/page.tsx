"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { registerSchema, RegisterFormValues } from "@/features/auth/schemas/authSchema";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { motion, Variants } from "framer-motion";
import { TextEffect } from "@/components/ui/text-effect";
import { authApi } from "@/features/auth/api/authApi";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setGlobalError(null);
    setIsSubmitting(true);
    try {
      await authApi.register(data);
      // RegisterResponse is unknown, but we don't need to consume it for navigation.
      setIsSubmitting(false);
      router.push("/onboarding");
    } catch (error: any) {
      if (error?.message === "Network Error") {
        console.warn("Backend not running. Proceeding with mock routing for UI testing.");
        setIsSubmitting(false);
        router.push("/onboarding");
      } else {
        setGlobalError(error?.message || "Registration failed. Please try again.");
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

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-[#FFFBE7]">
      {/* ── LEFT PANEL ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-[40%] lg:w-[45%] h-[170px] sm:h-[240px] md:h-screen md:sticky md:top-0 relative flex flex-col overflow-hidden"
      >
        <img
          src="/register-bg.jpg"
          alt="Market Landscape"
          className="absolute inset-0 w-full h-full object-cover object-[center_40%]"
        />
        {/* Darken top area slightly so the cream text pops against the sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#200813]/60 via-[#200813]/10 to-transparent md:bg-gradient-to-br md:from-[#200813]/70 md:via-transparent" />

        {/* Brand & Message Container (hidden on mobile, visible on tablet+) */}
        <div className="relative z-10 p-8 pt-10 md:pt-12 h-full hidden md:flex md:flex-col">
          <Link href="/" className="bg-[#FFFBE7] w-max h-14 px-6 rounded-xl flex items-center justify-center shadow-xl border border-black/5 hover:scale-[1.02] transition-transform block relative z-20">
            <img src="/logo-wordmark.png" alt="VentureRoot" className="h-8 w-auto object-contain mix-blend-multiply" />
          </Link>

          <div className="mt-12 pointer-events-none z-10">
            <div className="max-w-[380px] p-1">
              <h2 className="font-heading text-[28px] font-medium italic text-[#FFFBE7] leading-[1.15] [text-shadow:_0_4px_24px_rgba(0,0,0,0.6)]">
                <TextEffect per='char' preset='fade'>
                  Your idea deserves a clear path.
                </TextEffect>
              </h2>
            </div>
          </div>
        </div>

        {/* Mobile simple brand overlay */}
        <div className="relative z-10 p-4 sm:p-6 flex flex-col justify-end h-full md:hidden">
          <Link href="/" className="bg-[#FFFBE7] w-max h-10 sm:h-12 px-4 sm:px-5 rounded-xl flex items-center justify-center shadow-lg border border-black/5 mb-2 active:scale-[0.98] transition-transform block">
            <img src="/logo-wordmark.png" alt="VentureRoot" className="h-5 sm:h-6 w-auto object-contain mix-blend-multiply" />
          </Link>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full md:w-[60%] lg:w-[55%] flex flex-col min-h-screen">
        <div className="p-4 sm:p-6 md:p-8 flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12">
          <div className="w-full max-w-md">

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-8 md:text-left"
            >
              <h1 className="font-heading text-[32px] font-medium text-[#200813]">
                Create your account
              </h1>
              <p className="font-sans text-[14px] text-[#200813]/60 mt-2 font-normal">
                Start planning your local business today.
              </p>
            </motion.div>

            {globalError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{globalError}</p>
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
                <label className="block font-sans text-[14px] font-medium text-[#200813] mb-1.5" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  {...register("fullName")}
                  placeholder="Ravi Kumar"
                  className={`w-full rounded-xl bg-white border ${errors.fullName ? "border-red-300 focus:ring-red-200" : "border-[#200813]/10 focus:ring-[#1E6702]/20 focus:border-[#1E6702]"
                    } p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 text-[#200813] font-normal shadow-sm`}
                />
                {errors.fullName && (
                  <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.fullName.message}</p>
                )}
              </motion.div>

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

              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
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
                </div>

                <div>
                  <label className="block font-sans text-[14px] font-medium text-[#200813] mb-1.5" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      placeholder="••••••••"
                      className={`w-full rounded-xl bg-white border ${errors.confirmPassword ? "border-red-300 focus:ring-red-200" : "border-[#200813]/10 focus:ring-[#1E6702]/20 focus:border-[#1E6702]"
                        } p-3.5 pr-12 font-sans text-[14px] transition-all outline-none focus:ring-4 text-[#200813] font-normal shadow-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-[#200813]/40 hover:text-[#200813] transition-colors p-1"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-1 flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("termsAccepted" as const)}
                  className="mt-0.5 w-4 h-4 rounded border-[#200813]/20 text-[#1E6702] focus:ring-[#1E6702] bg-white transition-colors cursor-pointer shrink-0"
                />
                <span className="font-sans text-[12px] font-normal text-[#200813]/70 transition-colors leading-relaxed">
                  I agree to the <Link href="/terms" className="text-[#1E6702] font-medium hover:underline">Terms of Service</Link> & <Link href="/privacy" className="text-[#1E6702] font-medium hover:underline">Privacy Policy</Link>.
                </span>
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
                  "Create Account"
                )}
              </motion.button>
              
              <motion.div variants={itemVariants} className="mt-4 flex items-center justify-between w-full">
                <span className="w-[28%] border-b border-[#200813]/10"></span>
                <span className="font-sans text-[11px] text-[#200813]/40 font-bold uppercase tracking-wider">or continue with</span>
                <span className="w-[28%] border-b border-[#200813]/10"></span>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-2 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white border border-[#200813]/10 hover:bg-[#f9f9f9] transition-colors font-sans text-[14px] font-medium text-[#200813] shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300"
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white border border-[#200813]/10 hover:bg-[#f9f9f9] transition-colors font-sans text-[14px] font-medium text-[#200813] shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300"
                >
                  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.8 1.48.06 2.65.65 3.45 1.77-2.98 1.68-2.4 5.92.51 7.08-.66 1.7-1.64 3.28-2.54 4.12zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Apple
                </button>
              </motion.div>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center md:text-left font-sans text-[14px] text-[#200813]/60 mt-8 font-normal"
            >
              Already have an account? <Link href="/login" className="font-medium text-[#1E6702] hover:text-[#154a01] transition-colors ml-1">
                Sign in
              </Link>
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}
