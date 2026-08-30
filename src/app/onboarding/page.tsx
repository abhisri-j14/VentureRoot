import { OnboardingFlow } from "@/features/profile/components/OnboardingFlow";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#FFFBE7] relative overflow-hidden flex flex-col">
      {/* Top Left Logo */}
      <div className="absolute top-6 left-7 md:top-7 md:left-9 z-20">
        <Link href="/">
          <img src="/logo-2.png" alt="VentureRoot" className="h-8 md:h-9 w-auto object-contain" />
        </Link>
      </div>

      {/* Subtle Decorative SVGs (behind card) */}
      {/* Top Right Leaf / Organic Shape */}
      <svg className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] text-[#1E6702] opacity-[0.08] pointer-events-none transform rotate-12" viewBox="0 0 200 200" xmlns="http://www.w3.org/2003/svg">
        <path fill="currentColor" d="M45.7,-76.4C58.9,-69.3,69.1,-55.3,77.5,-40.5C85.9,-25.7,92.5,-10.1,90.4,4.5C88.2,19.1,77.3,32.7,66.6,44.9C55.9,57.1,45.4,67.9,32.3,74.5C19.2,81.1,3.5,83.5,-11.2,81.2C-25.9,78.9,-39.6,71.9,-51.9,62.1C-64.2,52.3,-75.1,39.7,-81.4,24.8C-87.7,9.9,-89.4,-7.3,-84.6,-22.8C-79.8,-38.3,-68.5,-52,-54.6,-59.4C-40.7,-66.8,-24.2,-67.9,-8,-64.1C8.2,-60.3,24.4,-51.6,32.5,-83.5L45.7,-76.4Z" transform="translate(100 100)" />
      </svg>
      
      {/* Bottom Left Small Dotted Pattern */}
      <svg className="absolute bottom-[5%] left-[2%] w-[250px] h-[250px] text-[#200813] opacity-[0.06] pointer-events-none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2003/svg">
         <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
           <circle fill="currentColor" cx="5" cy="5" r="1.5"></circle>
         </pattern>
         <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect>
      </svg>

      {/* Center Container for the Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10 w-full pt-20 md:pt-8">
        <OnboardingFlow />
      </div>
    </div>
  );
}
