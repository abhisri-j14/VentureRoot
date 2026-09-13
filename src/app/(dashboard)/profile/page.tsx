import { ProfileView } from "@/features/profile/components/ProfileView";

export default function ProfilePage() {
  return (
    <div className="flex-1 flex flex-col w-full min-w-0 max-w-full overflow-x-hidden pt-2 sm:pt-6 pb-16">
      <ProfileView />
    </div>
  );
}
