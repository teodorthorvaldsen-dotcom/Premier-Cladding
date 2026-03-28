import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/portal/session";
import { RegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function PortalRegisterPage() {
  const user = await getSessionFromCookies();
  if (user) {
    redirect("/portal");
  }
  return <RegisterForm />;
}
