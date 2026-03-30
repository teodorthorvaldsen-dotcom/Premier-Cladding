"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  bendAllowanceInches,
  bendDeductionInches,
  insideRadiusFromBendAllowance,
} from "@/lib/sheetMetalBend";

const BendDevelopmentPreview3D = dynamic(
  () => import("./BendDevelopmentPreview3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500 sm:col-span-2">
        Loading bend preview…
      </div>
    ),
  }
);

type Props = {
  /** Material thickness in inches (from panel thickness). */
  thicknessInches: number;
  /** Swatch / theme colors for 3D strip. */
  panelColorHex: string;
  /** Reference width for default strip width (in). */
  panelWidthIn: number;
};

export function BendDevelopmentSection({
  thicknessInches,
  panelColorHex,
  panelWidthIn,
}: Props) {
  const T = Math.max(0.001, thicknessInches);
  const [insideR, setInsideR] = useState(() => Math.max(0.0625, Math.round(T * 1000) / 1000));
  const [kFactor, setKFactor] = useState(0.33);
  const [angleDeg, setAngleDeg] = useState(90);
  const [leftLeg, setLeftLeg] = useState(3);
  const [rightLeg, setRightLeg] = useState(3);
  const [stripW, setStripW] = useState(() => Math.min(24, Math.max(6, panelWidthIn)));

  const ba = useMemo(
    () => bendAllowanceInches(angleDeg, insideR, T, kFactor),
    [angleDeg, insideR, T, kFactor]
  );
  const bd = useMemo(
    () => bendDeductionInches(angleDeg, insideR, T, kFactor),
    [angleDeg, insideR, T, kFactor]
  );

  const [baOverrideStr, setBaOverrideStr] = useState("");

  const applyBaOverride = () => {
    const v = Number(baOverrideStr);
    if (baOverrideStr === "" || Number.isNaN(v) || v <= 0) return;
    const newR = insideRadiusFromBendAllowance(v, angleDeg, T, kFactor);
    setInsideR(Math.round(newR * 1000) / 1000);
    setBaOverrideStr("");
  };

  return (
    <section
      className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-4"
      aria-labelledby="bend-development-heading"
    >
      <h2
        id="bend-development-heading"
        className="text-[15px] font-medium uppercase tracking-wider text-gray-500"
      >
        Bend allowance &amp; deduction (illustrative)
      </h2>
      <p className="mt-1 text-[11px] leading-snug text-gray-500">
        Adjust inside radius and K-factor to see bend allowance (BA) and bend deduction (BD).
        The flat view highlights the BA segment; the bent view is a 90° model. Confirm all values
        with your shop and material certs.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-[11px] font-medium text-gray-700">Inside radius R (in)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0.001}
            step="any"
            value={insideR}
            onChange={(e) => setInsideR(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[14px]"
          />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-[11px] font-medium text-gray-700">K-factor</span>
          <input
            type="number"
            inputMode="decimal"
            min={0.1}
            max={0.6}
            step={0.01}
            value={kFactor}
            onChange={(e) => setKFactor(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[14px]"
          />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-[11px] font-medium text-gray-700">Bend angle (°)</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={179}
            step={1}
            value={angleDeg}
            onChange={(e) => setAngleDeg(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[14px]"
          />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-[11px] font-medium text-gray-700">Strip width (in)</span>
          <input
            type="number"
            inputMode="decimal"
            min={1}
            step={0.5}
            value={stripW}
            onChange={(e) => setStripW(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[14px]"
          />
        </label>
        <label className="col-span-1 block">
          <span className="text-[11px] font-medium text-gray-700">Left leg (in)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.125}
            value={leftLeg}
            onChange={(e) => setLeftLeg(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[14px]"
          />
        </label>
        <label className="col-span-1 block">
          <span className="text-[11px] font-medium text-gray-700">Right leg (in)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.125}
            value={rightLeg}
            onChange={(e) => setRightLeg(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-2 py-1.5 text-[14px]"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2">
        <div className="min-w-[8rem]">
          <span className="text-[10px] font-medium uppercase tracking-wide text-amber-900/80">
            Bend allowance (BA)
          </span>
          <p className="text-lg font-semibold tabular-nums text-amber-950">{ba.toFixed(4)} in</p>
        </div>
        <div className="min-w-[8rem]">
          <span className="text-[10px] font-medium uppercase tracking-wide text-amber-900/80">
            Bend deduction (BD)
          </span>
          <p className="text-lg font-semibold tabular-nums text-amber-950">{bd.toFixed(4)} in</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5">
            <span className="whitespace-nowrap text-[11px] text-gray-600">Set R from target BA</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="BA"
              value={baOverrideStr}
              onChange={(e) => setBaOverrideStr(e.target.value)}
              className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-[13px]"
            />
          </label>
          <button
            type="button"
            onClick={applyBaOverride}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-gray-800"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="mt-4">
        <BendDevelopmentPreview3D
          baseHex={panelColorHex}
          bendAngleDeg={angleDeg}
          bendZoneHex="#ea580c"
          insideRadiusIn={insideR}
          kFactor={kFactor}
          leftLegIn={leftLeg}
          rightLegIn={rightLeg}
          stripWidthIn={stripW}
          thicknessIn={T}
        />
      </div>
    </section>
  );
}
