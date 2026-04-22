import { getSessionUser } from "@/lib/auth/get-session-user";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (user?.role === "AUDITOR") {
    redirect("/dpo/records");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-800">ตั้งค่า</h1>
      <p className="mt-2 text-sm text-slate-500">
        จัดการโปรไฟล์และการเชื่อมต่อระบบ — ขณะนี้แสดงข้อมูลจาก session หลังล็อกอิน
      </p>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">บัญชี</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-slate-50 pb-3">
            <dt className="text-slate-500">ชื่อที่แสดง</dt>
            <dd className="font-medium text-slate-900">{user?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-50 pb-3">
            <dt className="text-slate-500">บทบาท</dt>
            <dd className="font-medium text-slate-900">{user?.roleLabel ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">รหัสบทบาท (ระบบ)</dt>
            <dd className="font-mono text-xs text-slate-700">{user?.role ?? "—"}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs text-slate-400">
          การแก้ไขรหัสผ่านหรือโปรไฟล์แบบเต็มรูปแบบจะต้องเชื่อมกับ API ผู้ใช้เมื่อ backend พร้อม
        </p>
      </section>
    </div>
  );
}
