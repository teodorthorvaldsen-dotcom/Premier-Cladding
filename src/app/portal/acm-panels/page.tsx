import { redirect } from "next/navigation";
import { EmployeeAcmWorkspace } from "@/components/EmployeeAcmWorkspace";
import { getSessionUser } from "@/lib/auth";

export default async function EmployeeAcmPanelsWorkspacePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/portal/acm-panels");
  if (user.role !== "employee") redirect("/portal");
  return <EmployeeAcmWorkspace />;
}

