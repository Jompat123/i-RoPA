import { redirect } from "next/navigation";

import { DpoReviewQueuePage } from "@/components/dpo/DpoReviewQueuePage";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getDpoReviewsData } from "@/lib/data/get-dpo-reviews-data";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DpoReviewsPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (user?.role !== "DPO") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const data = await getDpoReviewsData(params);
  return <DpoReviewQueuePage data={data} />;
}
