import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/get-session-user";

export default async function DpoApprovePage() {
  const user = await getSessionUser();
  if (user?.role !== "DPO") {
    redirect("/");
  }

  redirect("/dpo/reviews");
}
