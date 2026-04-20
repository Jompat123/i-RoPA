export function Footer() {
  return (
    <footer className="shrink-0 border-t border-slate-100 bg-white px-6 py-3 md:px-8">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} i-RoPA · integrated with Netbay</p>
        <p className="text-slate-400">เวอร์ชัน 1.0 · ภายในองค์กร</p>
      </div>
    </footer>
  );
}
