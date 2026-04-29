"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { jsPDF } from "jspdf";

type PanelInput = {
  id: string;
  panelWidth: number;
  panelHeight: number;
  panelCount: number;
};

type Inputs = {
  mounting: "rout_return" | "face_fastened" | "rail";
  substrate: "metal" | "wood" | "concrete";
  windLoad: "low" | "medium" | "high";
  jointSize: number;
};

type KitResult = {
  clips: number;
  screws: number;
  sealant: number;
  trim: number;
  fastenerType: string;
  totalCost: number;
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function InstallmentKitConfiguratorPage() {
  const [panelTypes, setPanelTypes] = useState<PanelInput[]>([
    { id: "panel-1", panelWidth: 48, panelHeight: 96, panelCount: 10 },
  ]);
  const [inputs, setInputs] = useState<Inputs>({
    mounting: "rout_return",
    substrate: "metal",
    windLoad: "medium",
    jointSize: 0.5,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "mounting" || name === "substrate" || name === "windLoad") {
      setInputs((prev) => ({ ...prev, [name]: value }));
      return;
    }
    const parsed = Number(value);
    setInputs((prev) => ({ ...prev, [name]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  const handlePanelChange = (panelId: string, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsed = Number(value);
    setPanelTypes((prev) =>
      prev.map((panel) =>
        panel.id === panelId
          ? { ...panel, [name]: Number.isFinite(parsed) ? parsed : 0 }
          : panel
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
      },
    ]);
  };

  const removePanelType = (panelId: string) => {
    setPanelTypes((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== panelId) : prev));
  };

  const results = useMemo<KitResult>(() => {
    const jointSize = Number(inputs.jointSize);
    let spacing = 16;
    if (inputs.windLoad === "low") spacing = 24;
    if (inputs.windLoad === "high") spacing = 12;

    let totalClips = 0;
    let jointLength = 0;

    for (const panel of panelTypes) {
      const width = Number(panel.panelWidth);
      const height = Number(panel.panelHeight);
      const count = Number(panel.panelCount);
      const perimeter = 2 * (width + height);
      const clipsPerPanel = Math.ceil(perimeter / spacing);
      totalClips += clipsPerPanel * count;
      jointLength += count * (width + height) * 2;
    }

    const screwsPerClip = 2;
    let fastenerType = "Self-Drilling Screws";
    if (inputs.substrate === "wood") fastenerType = "Wood Screws";
    if (inputs.substrate === "concrete") fastenerType = "Concrete Anchors";

    const totalScrews = totalClips * screwsPerClip;
    const coveragePerTube = 1200;
    const jointMultiplier = Math.max(0.25, jointSize) / 0.5;
    const adjustedCoveragePerTube = coveragePerTube / jointMultiplier;
    const sealantTubes = Math.ceil(jointLength / adjustedCoveragePerTube);
    const trimLength = jointLength / 12;

    const wasteFactor = 1.1;

    const clips = Math.ceil(totalClips * wasteFactor);
    const screws = Math.ceil(totalScrews * wasteFactor);
    const sealant = Math.ceil(sealantTubes * wasteFactor);
    const trim = Math.ceil(trimLength * wasteFactor);
    const totalCost = clips * 2.5 + screws * 0.15 + sealant * 8 + trim * 3;

    return { clips, screws, sealant, trim, fastenerType, totalCost };
  }, [inputs, panelTypes]);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ACM Installation Kit Estimate", 14, 18);
    doc.setFontSize(11);
    let currentY = 32;
    doc.text("Panel Types:", 14, currentY);
    currentY += 8;
    panelTypes.forEach((panel, idx) => {
      doc.text(
        `${idx + 1}. ${panel.panelWidth}" x ${panel.panelHeight}" - Qty ${panel.panelCount}`,
        18,
        currentY
      );
      currentY += 8;
    });
    currentY += 2;
    doc.text(`Mounting: ${inputs.mounting.replaceAll("_", " ")}`, 14, currentY);
    currentY += 8;
    doc.text(`Substrate: ${inputs.substrate}`, 14, currentY);
    currentY += 8;
    doc.text(`Wind load: ${inputs.windLoad}`, 14, currentY);
    currentY += 8;
    doc.text(`Joint size: ${inputs.jointSize}"`, 14, currentY);

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
          {panelTypes.map((panel, index) => (
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
                    value={panel.panelWidth}
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
                    value={panel.panelHeight}
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
                    value={panel.panelCount}
                    onChange={(e) => handlePanelChange(panel.id, e)}
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  />
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addPanelType}
            className="inline-block rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-[14px] font-medium text-gray-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Add Another Panel Type
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Joint Size (in)</span>
            <input
              type="number"
              min={0.25}
              step={0.25}
              name="jointSize"
              value={inputs.jointSize}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Mounting Method</span>
            <select
              name="mounting"
              value={inputs.mounting}
              onChange={handleChange}
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
              value={inputs.substrate}
              onChange={handleChange}
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
              value={inputs.windLoad}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <option value="low">Low Wind</option>
              <option value="medium">Medium Wind</option>
              <option value="high">High Wind</option>
            </select>
          </label>
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

        <button
          type="button"
          onClick={exportPdf}
          className="mt-6 inline-block rounded-xl bg-gray-900 px-6 py-3 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
