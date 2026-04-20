import { DestructionTablePage } from "@/components/destruction/DestructionTablePage";
import { requireDataOwner } from "@/lib/auth/require-data-owner";
import { getDestructionPageData } from "@/lib/data/get-destruction-page-data";

type DestructionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DestructionPage({ searchParams }: DestructionPageProps) {
  await requireDataOwner();
  const params = (await searchParams) ?? {};
  const data = await getDestructionPageData(params);
  return <DestructionTablePage data={data} />;
}
