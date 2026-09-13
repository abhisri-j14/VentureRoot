import { PageFooter } from "@/components/layout/PageFooter";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full min-h-screen bg-[#FFFBE7] flex flex-col justify-between">
      <div className="flex-1 flex flex-col">{children}</div>
      <PageFooter className="mt-auto py-3 text-slate-400/80" />
    </main>
  );
}
