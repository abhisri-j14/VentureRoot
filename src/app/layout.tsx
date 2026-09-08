import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import { GoogleTranslateProvider } from "@/features/i18n/components/GoogleTranslateProvider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "VentureRoot",
  description: "VentureRoot — Business Feasibility & Planning Platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("ventureroot_locale")?.value || "en";

  return (
    <html lang={locale} className={`${manrope.variable} ${playfair.variable} font-sans`}>
      <body className="antialiased text-[#200813] bg-[#f4fce8]">
        <GoogleTranslateProvider />
        {children}
      </body>
    </html>
  );
}
