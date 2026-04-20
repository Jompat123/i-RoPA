export default function ActivitiesLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 animate-pulse">
      <div className="h-10 w-56 rounded-xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-[420px] rounded-2xl bg-slate-200" />
    </div>
  );
}
