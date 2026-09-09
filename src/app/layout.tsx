import type { Metadata } from "next";
import { Poppins, Lora } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { GoogleTranslateProvider } from "@/features/i18n/components/GoogleTranslateProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
    <html lang={locale} className={`${poppins.variable} ${lora.variable} font-sans`} suppressHydrationWarning>
      <body className="antialiased text-[#200813] bg-[#f4fce8]" suppressHydrationWarning>
        <GoogleTranslateProvider />
        {children}
      </body>
    </html>
  );
}
