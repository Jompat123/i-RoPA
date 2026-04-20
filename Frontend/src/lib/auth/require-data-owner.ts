import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/get-session-user";
import type { SessionUser } from "@/types/session";

/**
 * หน้าที่เป็นของ Data Owner เท่านั้น — role อื่นเข้าไม่ได้
 */
export async function requireDataOwner(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (user?.role !== "DATA_OWNER") {
    redirect("/");
  }
  return user;
}
