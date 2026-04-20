import { notFound, redirect } from "next/navigation";

import { DpoReviewDetailPage } from "@/components/dpo/DpoReviewDetailPage";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getDpoReviewDetailData } from "@/lib/data/get-dpo-reviews-data";

type Ctx = { params: Promise<{ id: string }> };

export default async function DpoReviewDetailRoute({ params }: Ctx) {
  const user = await getSessionUser();
  if (user?.role !== "DPO") {
    redirect("/");
  }

  const { id } = await params;
  const data = await getDpoReviewDetailData(id);
  if (!data) {
    notFound();
  }
  return <DpoReviewDetailPage key={id} data={data} />;
}
