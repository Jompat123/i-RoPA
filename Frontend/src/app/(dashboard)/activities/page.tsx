import { MyItemsTablePage } from "@/components/activities/MyItemsTablePage";
import { requireDataOwner } from "@/lib/auth/require-data-owner";
import { getMyItemsPageData } from "@/lib/data/get-my-items-page-data";

type ActivitiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  await requireDataOwner();
  const params = (await searchParams) ?? {};
  const data = await getMyItemsPageData(params);
  const saved = Array.isArray(params.saved) ? params.saved[0] : params.saved;
  return <MyItemsTablePage data={data} justSaved={saved === "1"} />;
}
