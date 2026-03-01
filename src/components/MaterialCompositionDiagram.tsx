"use client";

const LAYERS = [
  "Masking Film",
  "Finish Coating (PVDF or other)",
  "Aluminum Top Skin",
  "Bonding Layer",
  "Mineral-Filled Fire-Resistant Core",
  "Bonding Layer",
  "Aluminum Backer Skin",
  "Primer Finish",
] as const;

/** Original line-diagram showing Alfrex FR panel layer composition (cross-section). */
export function MaterialCompositionDiagram() {
  const layerCount = LAYERS.length;
  const rowHeight = 28;
  const diagramWidth = 200;

  return (
    <figure className="mx-auto max-w-[320px]" aria-label="Alfrex FR panel layer composition">
      <svg
        viewBox={`0 0 340 ${layerCount * rowHeight + 24}`}
        className="w-full text-gray-900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {LAYERS.map((label, i) => {
          const y = 14 + i * rowHeight;
          const isCore = label.includes("Core");
          return (
            <g key={label}>
              <line
                x1={0}
                y1={y}
                x2={diagramWidth}
                y2={y}
                stroke={isCore ? "#1f2937" : "#d1d5db"}
                strokeWidth={isCore ? 1.5 : 1}
              />
              <text
                x={diagramWidth + 12}
                y={y + 4}
                fill="#525252"
                fontSize="11"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="500"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
