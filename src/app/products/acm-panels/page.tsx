import dynamic from "next/dynamic";

const AcmPanelsClient = dynamic(() => import("./acm-panels-client"), {
  ssr: false,
});

export default function AcmPanelsPage() {
  return <AcmPanelsClient />;
}
