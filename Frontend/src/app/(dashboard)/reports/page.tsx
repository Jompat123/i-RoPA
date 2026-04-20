import { RopaStep1Form } from "@/components/ropa/RopaStep1Form";
import { requireDataOwner } from "@/lib/auth/require-data-owner";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function ReportsPage({ searchParams }: Props) {
  await requireDataOwner();
  const params = (await searchParams) ?? {};
  const recordId = getParam(params, "id");
  const fromStatus = getParam(params, "from");
  return <RopaStep1Form recordId={recordId || undefined} focusFix={fromStatus === "needs_fix"} />;
}
