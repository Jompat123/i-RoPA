import Link from "next/link";

import { RopaStepper } from "@/components/ropa/RopaStepper";

export default function RopaStep2PlaceholderPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
      <RopaStepper currentStep={2} />
      <p className="mt-8 text-center text-slate-600">
        ขั้นตอนที่ 2 — กำลังจะเพิ่มฟอร์มในลำดับถัดไป
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Link
          href="/reports"
          className="rounded-full border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          กลับขั้นตอนที่ 1
        </Link>
      </div>
    </div>
  );
}
