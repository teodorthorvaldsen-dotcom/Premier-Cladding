import { Configurator } from "@/components/Configurator";

export default function FlashingConfiguratorPage() {
  return (
    <Configurator
      title="Flashing Configurator"
      subtitle="Configure your flashing. Pricing updates automatically."
      productLabel="Flashing"
      returnUrl="/flashing-configurator"
      variant="flashing"
      defaultWidthIn={10}
      defaultLengthIn={120}
      hideSizeMinimums
    />
  );
}

