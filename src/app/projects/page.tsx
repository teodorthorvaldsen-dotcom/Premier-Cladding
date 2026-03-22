import { redirect } from "next/navigation";

/** Former Our Work gallery — now lives on /about (#our-work). */
export default function ProjectsIndexRedirect() {
  redirect("/about");
}
