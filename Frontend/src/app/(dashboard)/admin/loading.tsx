export default function AdminLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl animate-pulse flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-[420px] rounded-2xl bg-slate-200" />
    </div>
  );
}
