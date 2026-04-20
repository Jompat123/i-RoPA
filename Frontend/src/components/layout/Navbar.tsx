"use client";

import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Search,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import type { SessionUser } from "@/types/session";

type NavbarProps = {
  /** จาก cookie หลังล็อกอิน — ถ้าไม่มีจะแสดง placeholder */
  user: SessionUser | null;
};

export function Navbar({ user }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      window.location.assign("/login");
    } catch {
      setLoggingOut(false);
    }
  }

  const displayName = user?.name ?? "ผู้ใช้";
  const displayRole = user?.roleLabel ?? "—";

  return (
    <header className="flex w-full shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 py-4 md:px-8">
      <div className="relative flex w-full max-w-sm items-center">
        <span className="pointer-events-none absolute left-4 flex items-center justify-center text-slate-400">
          <Search className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <input
          type="search"
          placeholder="ค้นหา"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-full border-0 bg-slate-100 py-2.5 pl-12 pr-4 text-sm text-slate-700 outline-none ring-blue-200 transition focus:ring-2"
          aria-label="ค้นหา"
        />
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button
          type="button"
          className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-50"
          aria-label="การแจ้งเตือน"
        >
          <Bell className="h-6 w-6" strokeWidth={2} aria-hidden />
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button>

        <button
          type="button"
          className="rounded-full p-2 text-slate-600 transition hover:bg-slate-50"
          aria-label="ช่วยเหลือ"
        >
          <CircleHelp className="h-6 w-6" strokeWidth={2} aria-hidden />
        </button>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 md:gap-3 md:pl-6">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UserRound className="h-6 w-6" strokeWidth={2} aria-hidden />
            </span>
          )}
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-semibold text-slate-800">
              {displayName}
            </span>
            <span className="text-xs text-slate-400">{displayRole}</span>
          </div>
          <ChevronDown
            className="hidden h-4 w-4 text-slate-500 sm:block"
            strokeWidth={2}
            aria-hidden
          />
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="ml-1 rounded-full p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            aria-label="ออกจากระบบ"
            title="ออกจากระบบ"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}
