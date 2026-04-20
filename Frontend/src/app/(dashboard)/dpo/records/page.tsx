import { redirect } from "next/navigation";

import { DpoRecordsPage } from "@/components/dpo/DpoRecordsPage";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getDpoRecordsData } from "@/lib/data/get-dpo-records-data";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DpoRecordsRoute({ searchParams }: Props) {
  const user = await getSessionUser();
  if (user?.role !== "DPO") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const data = await getDpoRecordsData(params);
  return <DpoRecordsPage data={data} />;
}
