"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import { useCart } from "@/context/CartContext";

type PanelInput = {
  id: string;
  panelWidth: number;
  panelHeight: number;
  panelCount: number;
  wallWidth: number;
  wallHeight: number;
  jointSize: number;
  mounting: "rout_return" | "face_fastened" | "rail";
  substrate: "metal" | "wood" | "concrete";
  windLoad: "low" | "medium" | "high";
};

type KitResult = {
  clips: number;
  screws: number;
  sealant: number;
  trim: number;
  fastenerType: string;
  totalCost: number;
};

type PanelTypeResult = {
  panelId: string;
  fastenerType: string;
  cols: number;
  rows: number;
  layoutPanels: number;
  wastePercent: number;
  clips: number;
  screws: number;
  sealant: number;
  trim: number;
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const toInputValue = (n: number) => (Number.isFinite(n) ? n : "");
const parseNumberInput = (raw: string) => (raw.trim() === "" ? Number.NaN : Number(raw));
const printableNumber = (n: number) => (Number.isFinite(n) ? String(n) : "-");

export default function InstallmentKitConfiguratorPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const [panelTypes, setPanelTypes] = useState<PanelInput[]>([
    {
      id: "panel-1",
      panelWidth: 48,
      panelHeight: 96,
      panelCount: 10,
      wallWidth: 240,
      wallHeight: 120,
      jointSize: 0.5,
      mounting: "rout_return",
      substrate: "metal",
      windLoad: "medium",
    },
  ]);

  const handlePanelChange = (
    panelId: string,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "mounting" || name === "substrate" || name === "windLoad") {
      setPanelTypes((prev) =>
        prev.map((panel) => (panel.id === panelId ? { ...panel, [name]: value } : panel))
      );
      return;
    }
    const parsed = parseNumberInput(value);
    setPanelTypes((prev) =>
      prev.map((panel) =>
        panel.id === panelId ? { ...panel, [name]: parsed } : panel
      )
    );
  };

  const addPanelType = () => {
    setPanelTypes((prev) => [
      ...prev,
      {
        id: `panel-${Date.now()}`,
        panelWidth: 48,
        panelHeight: 96,
        panelCount: 1,
        wallWidth: 240,
        wallHeight: 120,
        jointSize: 0.5,
        mounting: "rout_return",
        substrate: "metal",
        windLoad: "medium",
      },
    ]);
  };

  const removePanelType = (panelId: string) => {
    setPanelTypes((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== panelId) : prev));
  };

  const panelTypeResults = useMemo<PanelTypeResult[]>(() => {
    const screwsPerClip = 2;
    const coveragePerTube = 1200;
    const wasteFactor = 1.1;

    return panelTypes.map((panel) => {
      const width = Number.isFinite(panel.panelWidth) ? panel.panelWidth : 0;
      const height = Number.isFinite(panel.panelHeight) ? panel.panelHeight : 0;
      const count = Math.max(0, Number.isFinite(panel.panelCount) ? panel.panelCount : 0);
      const wallWidth = Number.isFinite(panel.wallWidth) ? panel.wallWidth : 0;
      const wallHeight = Number.isFinite(panel.wallHeight) ? panel.wallHeight : 0;
      const jointSize = Number.isFinite(panel.jointSize) ? panel.jointSize : 0;

      let spacing = 16;
      if (panel.windLoad === "low") spacing = 24;
      if (panel.windLoad === "high") spacing = 12;

      let fastenerType = "Self-Drilling Screws";
      if (panel.substrate === "wood") fastenerType = "Wood Screws";
      if (panel.substrate === "concrete") fastenerType = "Concrete Anchors";

      const effectivePanelWidth = width + jointSize;
      const effectivePanelHeight = height + jointSize;
      const cols =
        wallWidth > 0 && width > 0 ? Math.floor((wallWidth + jointSize) / effectivePanelWidth) : 0;
      const rows =
        wallHeight > 0 && height > 0
          ? Math.floor((wallHeight + jointSize) / effectivePanelHeight)
          : 0;
      const layoutPanels = Math.max(0, cols * rows);
      const wallArea = wallWidth * wallHeight;
      const coveredPanelArea = layoutPanels * (width * height);
      const wasteArea = Math.max(0, wallArea - coveredPanelArea);
      const wastePercentRaw = wallArea > 0 ? (wasteArea / wallArea) * 100 : 0;
      const wastePercent = Number(wastePercentRaw.toFixed(2));

      const perimeter = 2 * (width + height);
      const clipsPerPanel = Math.ceil(perimeter / spacing);
      const totalClips = clipsPerPanel * count;
      const totalScrews = totalClips * screwsPerClip;
      const jointLength = count * (width + height) * 2;
      const jointMultiplier = Math.max(0.25, jointSize) / 0.5;
      const adjustedCoveragePerTube = coveragePerTube / jointMultiplier;
      const sealantTubes = Math.ceil(jointLength / adjustedCoveragePerTube);
      const trimLength = jointLength / 12;

      return {
        panelId: panel.id,
        fastenerType,
        cols,
        rows,
        layoutPanels,
        wastePercent,
        clips: Math.ceil(totalClips * wasteFactor),
        screws: Math.ceil(totalScrews * wasteFactor),
        sealant: Math.ceil(sealantTubes * wasteFactor),
        trim: Math.ceil(trimLength * wasteFactor),
      };
    });
  }, [panelTypes]);

  const results = useMemo<KitResult>(() => {
    const clips = panelTypeResults.reduce((sum, item) => sum + item.clips, 0);
    const screws = panelTypeResults.reduce((sum, item) => sum + item.screws, 0);
    const sealant = panelTypeResults.reduce((sum, item) => sum + item.sealant, 0);
    const trim = panelTypeResults.reduce((sum, item) => sum + item.trim, 0);
    const totalCost = clips * 2.5 + screws * 0.15 + sealant * 8 + trim * 3;
    const hasWood = panelTypeResults.some((item) => item.fastenerType === "Wood Screws");
    const hasConcrete = panelTypeResults.some((item) => item.fastenerType === "Concrete Anchors");
    const hasMetal = panelTypeResults.some((item) => item.fastenerType === "Self-Drilling Screws");
    const fastenerType =
      hasWood && hasConcrete && hasMetal
        ? "Mixed Fasteners"
        : hasWood && hasConcrete
          ? "Wood/Concrete Fasteners"
          : hasWood && hasMetal
            ? "Wood/Metal Fasteners"
            : hasConcrete && hasMetal
              ? "Concrete/Metal Fasteners"
              : hasWood
                ? "Wood Screws"
                : hasConcrete
                  ? "Concrete Anchors"
                  : "Self-Drilling Screws";

    return { clips, screws, sealant, trim, fastenerType, totalCost };
  }, [panelTypeResults]);

  const handleAddToCart = () => {
    const totalPanels = panelTypes.reduce((sum, panel) => {
      const count = Number.isFinite(panel.panelCount) ? panel.panelCount : 0;
      return sum + Math.max(0, count);
    }, 0);
    const areaFt2 = panelTypes.reduce((sum, panel) => {
      const width = Number.isFinite(panel.panelWidth) ? panel.panelWidth : 0;
      const height = Number.isFinite(panel.panelHeight) ? panel.panelHeight : 0;
      const count = Number.isFinite(panel.panelCount) ? panel.panelCount : 0;
      return sum + (width * height * Math.max(0, count)) / 144;
    }, 0);
    const clipsPerPanel = totalPanels > 0 ? results.clips / totalPanels : results.clips;

    addItem({
      productKind: "acm",
      productLabel: "Installment Kit",
      widthIn: 1,
      heightIn: 1,
      standardId: null,
      colorId: "classic-white",
      finishId: "standard",
      thicknessId: "4mm",
      quantity: 1,
      unitPrice: Number(results.totalCost.toFixed(2)),
      areaFt2: Number(areaFt2.toFixed(2)),
      panelType: "installment-kit",
      panelTypeLabel: `Installment kit (${totalPanels} panels equivalent)`,
      clipsNeeded: results.clips,
      clipsPerPanel: Number(clipsPerPanel.toFixed(2)),
      trayBuildSpec: panelTypes
        .map(
          (panel, i) =>
            `Type ${i + 1}: ${printableNumber(panel.panelWidth)}x${printableNumber(panel.panelHeight)} in, qty ${printableNumber(panel.panelCount)}, wall ${printableNumber(panel.wallWidth)}x${printableNumber(panel.wallHeight)} in, joint ${printableNumber(panel.jointSize)} in, ${panel.mounting}, ${panel.substrate}, ${panel.windLoad} wind`
        )
        .join("\n"),
    });
    router.push("/cart");
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ACM Installation Kit Estimate", 14, 18);
    doc.setFontSize(11);
    let currentY = 32;
    doc.text("Panel Types:", 14, currentY);
    currentY += 8;
    panelTypes.forEach((panel, idx) => {
      const perType = panelTypeResults.find((item) => item.panelId === panel.id);
      doc.text(
        `${idx + 1}. ${printableNumber(panel.panelWidth)}" x ${printableNumber(panel.panelHeight)}" - Qty ${printableNumber(panel.panelCount)}`,
        18,
        currentY
      );
      currentY += 8;
      if (perType) {
        doc.text(
          `   Wall ${printableNumber(panel.wallWidth)}" x ${printableNumber(panel.wallHeight)}", Joint ${printableNumber(panel.jointSize)}", ${panel.mounting.replaceAll("_", " ")}, ${panel.windLoad} wind`,
          22,
          currentY
        );
        currentY += 8;
        doc.text(
          `   Layout ${perType.cols}x${perType.rows} (${perType.layoutPanels} panels, ${perType.wastePercent}% waste)`,
          22,
          currentY
        );
        currentY += 8;
        doc.text(
          `   Clips ${perType.clips}, Fasteners ${perType.screws} (${perType.fastenerType}), Sealant ${perType.sealant}, Trim ${perType.trim} ft`,
          22,
          currentY
        );
        currentY += 8;
      }
    });

    currentY += 16;
    doc.text(`Clips: ${results.clips}`, 14, currentY);
    currentY += 8;
    doc.text(`Fasteners (${results.fastenerType}): ${results.screws}`, 14, currentY);
    currentY += 8;
    doc.text(`Sealant tubes: ${results.sealant}`, 14, currentY);
    currentY += 8;
    doc.text(`Trim (ft): ${results.trim}`, 14, currentY);
    currentY += 12;
    doc.setFontSize(13);
    doc.text(`Estimated total: ${currency.format(results.totalCost)}`, 14, currentY);

    doc.save("acm-installation-kit-estimate.pdf");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Installment Kit Configurator
        </h1>
        <p className="mt-2 text-[15px] text-gray-600">
          Enter one or more panel types to estimate clips, fasteners, sealant, trim, and total
          cost.
        </p>

        <div className="mt-6 space-y-4">
          {panelTypes.map((panel, index) => {
            const perType = panelTypeResults.find((item) => item.panelId === panel.id);
            return (
            <div key={panel.id} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Panel Type {index + 1}</h2>
                <button
                  type="button"
                  onClick={() => removePanelType(panel.id)}
                  disabled={panelTypes.length === 1}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Panel Width (in)
                  </span>
                  <input
                    type="number"
                    min={1}
                    name="panelWidth"
                    value={toInputValue(panel.panelWidth)}
                    onChange={(e) => handlePanelChange(panel.id, e)}
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Panel Height (in)
                  </span>
                  <input
                    type="number"
                    min={1}
                    name="panelHeight"
                    value={toInputValue(panel.panelHeight)}
                    onChange={(e) => handlePanelChange(panel.id, e)}
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Number of Panels
                  </span>
                  <input
                    type="number"
                    min={1}
                    name="panelCount"
                    value={toInputValue(panel.panelCount)}
                    onChange={(e) => handlePanelChange(panel.id, e)}
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  />
                </label>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Wall Width (in)</span>
                  <input
                    type="number"
                    min={1}
                    name="wallWidth"
                    value={toInputValue(panel.wallWidth)}
                    onChange={(e) => handlePanelChange(panel.id, e)}
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Wall Height (in)</span>
                  <input
                    type="number"
                    min={1}
                    name="wallHeight"
                    value={toInputValue(panel.wallHeight)}
                    onChange={(e) => handlePanelChange(panel.id, e)}
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Joint Size (in)</span>
                  <input
                    type="number"
                    min={0.25}
                    step={0.25}
                    name="jointSize"
                    value={toInputValue(panel.jointSize)}
                    onChange={(e) => handlePanelChange(panel.id, e)}
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Mounting Method</span>
                  <select
                    name="mounting"
                    value={panel.mounting}
                    onChange={(e) => handlePanelChange(panel.id, e)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    <option value="rout_return">Rout & Return</option>
                    <option value="face_fastened">Face Fastened</option>
                    <option value="rail">Rail System</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Substrate Type</span>
                  <select
                    name="substrate"
                    value={panel.substrate}
                    onChange={(e) => handlePanelChange(panel.id, e)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    <option value="metal">Metal Studs</option>
                    <option value="wood">Wood Framing</option>
                    <option value="concrete">Concrete / CMU</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Wind Load</span>
                  <select
                    name="windLoad"
                    value={panel.windLoad}
                    onChange={(e) => handlePanelChange(panel.id, e)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    <option value="low">Low Wind</option>
                    <option value="medium">Medium Wind</option>
                    <option value="high">High Wind</option>
                  </select>
                </label>
              </div>
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-[14px] text-gray-700">
                <p className="font-medium text-gray-800">Per Type Materials</p>
                <p className="mt-1">Layout: {perType?.cols ?? 0} columns x {perType?.rows ?? 0} rows ({perType?.layoutPanels ?? 0} panels)</p>
                <p className="mt-1">Layout Waste: {perType?.wastePercent ?? 0}%</p>
                <p className="mt-1">Mounting Clips: {perType?.clips ?? 0}</p>
                <p className="mt-1">Fasteners ({perType?.fastenerType ?? "Self-Drilling Screws"}): {perType?.screws ?? 0}</p>
                <p className="mt-1">Sealant Tubes: {perType?.sealant ?? 0}</p>
                <p className="mt-1">Trim (ft): {perType?.trim ?? 0}</p>
              </div>
            </div>
            );
          })}
          <button
            type="button"
            onClick={addPanelType}
            className="inline-block rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-[14px] font-medium text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Add Another Panel Type
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Kit Summary</h2>
          <p className="mt-2 text-[15px] text-gray-700">Mounting Clips: {results.clips}</p>
          <p className="mt-1 text-[15px] text-gray-700">
            Fasteners ({results.fastenerType}): {results.screws}
          </p>
          <p className="mt-1 text-[15px] text-gray-700">Sealant Tubes: {results.sealant}</p>
          <p className="mt-1 text-[15px] text-gray-700">Trim (ft): {results.trim}</p>
          <p className="mt-3 text-base font-semibold text-gray-900">
            Estimated Total: {currency.format(results.totalCost)}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-block rounded-xl border border-gray-300 bg-white px-6 py-3 text-[15px] font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={exportPdf}
            className="inline-block rounded-xl bg-gray-900 px-6 py-3 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
