import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";
import { getSessionUser } from "@/lib/auth/get-session-user";

/** อ่าน cookie ทุกครั้ง — ถ้าล็อกอินแล้วให้เด้งไปแดชบอร์ด */
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#F5F7FA] px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.55] blur-[2px]"
        style={{ backgroundImage: "url('/images/login-bg.png')" }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[#F5F7FA]/75" aria-hidden />
      <div className="relative z-10 flex w-full max-w-6xl justify-center">
        <Suspense
          fallback={
            <div className="h-[560px] w-full max-w-5xl animate-pulse rounded-3xl bg-white/60 shadow-xl" aria-hidden />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
