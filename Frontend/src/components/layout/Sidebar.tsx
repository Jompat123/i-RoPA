"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getDashboardNav } from "@/config/navigation";
import type { SessionUser } from "@/types/session";

type SidebarProps = {
  user: SessionUser | null;
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const nav = getDashboardNav(user?.role);
  const activeHref = [...nav]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.href;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-gradient-to-b from-[#1e3a8a] to-[#172554]">
      <div className="flex w-full flex-col items-center p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Image src="/images/logo.png" alt="i-RoPA logo" width={24} height={24} />
          </div>
          <span className="flex items-center text-2xl font-semibold text-white">
            i-RoPA
          </span>
        </div>
        <p className="mt-1 text-center text-xs font-medium text-white/90">
          integrated with <span className="text-teal-400">Netbay</span>
        </p>
      </div>

      <nav className="flex w-full flex-1 flex-col gap-2 px-4 pb-6">
        {nav.map((item) => {
          const active = item.href === activeHref;

          const Icon = item.Icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl p-3 text-sm transition-colors ${
                active
                  ? "bg-white/15 text-teal-300"
                  : "text-blue-100/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon
                className="h-5 w-5 shrink-0 opacity-95"
                strokeWidth={2}
                aria-hidden
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
