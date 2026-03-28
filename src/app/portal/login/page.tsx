import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/portal/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function PortalLoginPage() {
  const user = await getSessionFromCookies();
  if (user) {
    redirect("/portal");
  }
  return <LoginForm />;
}
