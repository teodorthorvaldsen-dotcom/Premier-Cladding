"use client";

export type PanelConfiguratorPhotoPreviewProps = {
  panelWidthIn: number;
  panelHeightIn: number;
  panelDepthIn: number;
  compact?: boolean;
};

export function PanelConfiguratorPhotoPreview({
  panelWidthIn,
  panelHeightIn,
  panelDepthIn,
  compact = false,
}: PanelConfiguratorPhotoPreviewProps) {
  return (
    <div className={compact ? "flex flex-col gap-1.5" : "flex flex-col gap-2"}>
      {!compact && (
        <p className="text-[13px] text-gray-600">Static preview (grid background).</p>
      )}
      {compact && (
        <p className="text-[11px] leading-snug text-gray-600">Static preview (grid background).</p>
      )}

      <div
        className="overflow-hidden rounded-xl border border-gray-200 bg-[#eef1f4] shadow-inner"
        style={{ aspectRatio: "1400 / 1100" }}
      >
        <img
          src="/panel-preview-grid.png"
          alt={`ACM panel preview grid background for ${panelWidthIn}" × ${panelHeightIn}"`}
          className="h-full w-full object-contain"
        />
      </div>

      <p
        className={
          compact
            ? "text-center text-[10px] font-semibold tabular-nums text-gray-700"
            : "text-center text-[12px] font-semibold tabular-nums text-gray-800"
        }
      >
        {panelWidthIn}" × {panelHeightIn}" · {panelDepthIn.toFixed(2)}" deep
      </p>
    </div>
  );
}
