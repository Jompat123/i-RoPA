export default function DpoReviewDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 animate-pulse">
      <div className="h-44 rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="h-[560px] rounded-2xl bg-slate-200" />
        <div className="h-[560px] rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
