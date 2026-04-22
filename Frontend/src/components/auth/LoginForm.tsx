"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Key, Loader2, User } from "lucide-react";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" width="21" height="21" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem("iropa_remember_email");
        if (saved) {
          setEmail(saved);
          setRemember(true);
        }
      } catch {
        // ignore
      }
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      try {
        if (remember) {
          localStorage.setItem("iropa_remember_email", email);
        } else {
          localStorage.removeItem("iropa_remember_email");
        }
      } catch {
        // ignore
      }
      window.location.assign(nextPath);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200/80 lg:max-w-5xl lg:flex-row lg:rounded-3xl">
      {/* ซ้าย: แบรนด์ */}
      <aside className="flex flex-col items-center justify-center bg-[#0a2744] px-8 py-12 text-center lg:w-[42%] lg:px-10 lg:py-16">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-row flex-wrap items-center justify-center gap-4">
            <Image
              src="/images/logo.png"
              width={512}
              height={512}
              alt="i-RoPA"
              priority
              quality={95}
              sizes="(max-width: 640px) 64px, 88px"
              className="h-16 w-16 shrink-0 rounded-2xl object-contain shadow-lg sm:h-[5.5rem] sm:w-[5.5rem]"
            />
            <h2 className="text-left text-3xl font-bold tracking-tight text-white sm:text-4xl">i-RoPA</h2>
          </div>
          <p className="text-sm text-white/90">
            integrated with <span className="font-semibold text-[#5eead4]">Netbay</span>
          </p>
        </div>
      </aside>

      {/* ขวา: ฟอร์ม */}
      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-800">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-sm text-slate-500">โปรดลงชื่อเข้าใช้เพื่อจัดการ ROPA ของคุณ</p>

          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-slate-600">
                อีเมล
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20"
                  placeholder="example@domain.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-slate-600">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Key className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#003366] focus:bg-white focus:ring-2 focus:ring-[#003366]/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 transition hover:bg-slate-200/80 hover:text-slate-600"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#003366] focus:ring-[#003366]"
                />
                จดจำฉัน
              </label>
              <button
                type="button"
                className="text-[#0057cc] underline-offset-2 hover:underline"
                onClick={() => alert("ติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน (ยังไม่เชื่อมระบบจริง)")}
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            {error ? (
              <p
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#003366] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00264d] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">หรือเข้าสู่ระบบด้วย</span>
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
              onClick={() => alert("การเข้าสู่ระบบด้วย Microsoft จะเชื่อมในรุ่นถัดไป") }
            >
              <MicrosoftLogo />
              เข้าสู่ระบบด้วย Microsoft
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            หากยังไม่มีบัญชี?{" "}
            <span className="font-medium text-[#0057cc]">ติดต่อผู้ดูแลระบบของคุณ</span>
          </p>

          <details className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2 text-left text-[11px] text-slate-500">
            <summary className="cursor-pointer font-medium text-slate-600">บัญชีทดสอบ (dev)</summary>
            <ul className="mt-2 space-y-0.5 font-mono">
              <li>admin@i-ropa.local / password123</li>
              <li>dpo@i-ropa.local / password123</li>
              <li>owner@i-ropa.local / password123</li>
              <li>auditor@i-ropa.local / password123</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}
