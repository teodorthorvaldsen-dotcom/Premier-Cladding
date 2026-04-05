import { redirect } from "next/navigation";
import { Configurator } from "@/components/Configurator";
import { getSessionUser } from "@/lib/auth";

export default async function ACMPanelsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/products/acm-panels");
  }
  if (user.role !== "employee") {
    redirect("/portal");
  }
  return <Configurator />;
}
