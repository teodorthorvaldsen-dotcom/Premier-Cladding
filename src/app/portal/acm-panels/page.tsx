import { redirect } from "next/navigation";
import { SubcontractorAcmWorkspace } from "@/components/SubcontractorAcmWorkspace";
import { getSessionUser } from "@/lib/auth";

export default async function PortalAcmPanelsWorkspacePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=%2Fportal%2Facm-panels");
  }
  if (user.role !== "subcontractor" && user.role !== "admin") {
    redirect("/");
  }
  return <SubcontractorAcmWorkspace />;
}
