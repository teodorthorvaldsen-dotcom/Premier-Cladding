import type { ReactNode } from "react";
import { AboutSubnav } from "@/components/AboutSubnav";

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AboutSubnav />
      {children}
    </div>
  );
}

