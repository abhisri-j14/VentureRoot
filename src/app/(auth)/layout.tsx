export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full min-h-screen bg-[#FFFBE7]">
      {children}
    </main>
  );
}
