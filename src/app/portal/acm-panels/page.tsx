import { redirect } from "next/navigation";
import { SubcontractorAcmWorkspace } from "@/components/SubcontractorAcmWorkspace";
import { getSessionUser } from "@/lib/auth";

export default async function AcmPanelsWorkspacePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/portal/acm-panels");
  if (user.role !== "subcontractor" && user.role !== "admin") redirect("/portal");
  return <SubcontractorAcmWorkspace />;
}

