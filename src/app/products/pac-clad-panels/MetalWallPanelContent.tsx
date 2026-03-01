"use client";

import { useCallback, useRef, useState } from "react";
import { MetalConfigurator } from "@/components/MetalConfigurator";
import { MetalSystemsBrowser } from "@/components/MetalSystemsBrowser";
import type { MetalSystemId } from "@/components/SystemPicker";

export function MetalWallPanelContent() {
  const [systemId, setSystemId] = useState<MetalSystemId | null>(null);
  const configuratorRef = useRef<HTMLElement | null>(null);

  const handleAddToEstimate = useCallback((configKey: string) => {
    const id = configKey as MetalSystemId;
    const valid: MetalSystemId[] = [
      "flush-reveal",
      "board-batten",
      "precision-series",
      "exposed-fastener",
      "specialty-custom",
    ];
    if (valid.includes(id)) {
      setSystemId(id);
      configuratorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <>
      <MetalSystemsBrowser onAddToEstimate={handleAddToEstimate} />
      <section ref={configuratorRef}>
        <MetalConfigurator
          externalSystemId={systemId}
          onExternalSystemIdChange={setSystemId}
        />
      </section>
    </>
  );
}
