export default function DpoLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 animate-pulse">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-28 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-slate-200" />
    </div>
  );
}
