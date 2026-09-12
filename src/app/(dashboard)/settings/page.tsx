import { SettingsView } from "@/features/settings/components/SettingsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — VentureRoot",
  description: "Manage your VentureRoot profile, operational base location, language, and intelligence preferences.",
};

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col pt-4 pb-16">
      <SettingsView />
    </div>
  );
}
