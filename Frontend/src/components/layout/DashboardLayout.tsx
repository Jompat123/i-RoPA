import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import type { SessionUser } from "@/types/session";

type DashboardLayoutProps = {
  children: React.ReactNode;
  user: SessionUser | null;
};

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat p-4 md:p-6"
      style={{ backgroundImage: "url('/images/office-bg.png')" }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-slate-900/40"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] flex-col overflow-hidden rounded-3xl border border-white/25 bg-white/95 shadow-xl shadow-slate-900/20 backdrop-blur-sm md:flex-row md:h-[calc(100vh-2rem)]">
        <Sidebar user={user} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50/95">
          <Navbar user={user} />
          <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
