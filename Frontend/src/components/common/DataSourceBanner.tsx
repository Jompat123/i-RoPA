type Props = {
  source: "api" | "mock";
  loadError?: string | null;
  className?: string;
};

/**
 * แสดงเมื่อโหลด API ล้มเหลว หรือกำลังใช้ข้อมูลจำลอง
 */
export function DataSourceBanner({ source, loadError, className = "" }: Props) {
  if (loadError) {
    return (
      <div
        role="alert"
        className={`rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 ${className}`}
      >
        {loadError}
      </div>
    );
  }
  if (source === "mock") {
    return (
      <div
        className={`rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 ${className}`}
      >
        กำลังแสดงข้อมูลจำลอง (mock) — ต่อ backend จริงแล้วจะหายไป
      </div>
    );
  }
  return null;
}
