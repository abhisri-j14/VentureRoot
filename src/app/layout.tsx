import type { Metadata, Viewport } from "next";
import { Poppins, Lora } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { GoogleTranslateProvider } from "@/features/i18n/components/GoogleTranslateProvider";
import PwaRegister from "@/components/pwa/PwaRegister";
import InstallPrompt from "@/components/pwa/InstallPrompt";

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

export const viewport: Viewport = {
  themeColor: "#1E6702",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "VentureRoot — Business Feasibility & Planning",
    template: "%s | VentureRoot",
  },
  description: "VentureRoot — Business Feasibility & Planning Platform",
  applicationName: "VentureRoot",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VentureRoot",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
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
        <PwaRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}

