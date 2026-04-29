"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { jsPDF } from "jspdf";

type Inputs = {
  panelWidth: number;
  panelHeight: number;
  panelCount: number;
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
  const [inputs, setInputs] = useState<Inputs>({
    panelWidth: 48,
    panelHeight: 96,
    panelCount: 10,
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

  const results = useMemo<KitResult>(() => {
    const width = Number(inputs.panelWidth);
    const height = Number(inputs.panelHeight);
    const count = Number(inputs.panelCount);
    const jointSize = Number(inputs.jointSize);

    const perimeter = 2 * (width + height);

    let spacing = 16;
    if (inputs.windLoad === "low") spacing = 24;
    if (inputs.windLoad === "high") spacing = 12;

    const clipsPerPanel = Math.ceil(perimeter / spacing);
    const totalClips = clipsPerPanel * count;

    const screwsPerClip = 2;
    let fastenerType = "Self-Drilling Screws";
    if (inputs.substrate === "wood") fastenerType = "Wood Screws";
    if (inputs.substrate === "concrete") fastenerType = "Concrete Anchors";

    const totalScrews = totalClips * screwsPerClip;
    const jointLength = count * (width + height) * 2;
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
  }, [inputs]);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ACM Installation Kit Estimate", 14, 18);
    doc.setFontSize(11);
    doc.text(`Panel size: ${inputs.panelWidth}" x ${inputs.panelHeight}"`, 14, 32);
    doc.text(`Panel count: ${inputs.panelCount}`, 14, 40);
    doc.text(`Mounting: ${inputs.mounting.replaceAll("_", " ")}`, 14, 48);
    doc.text(`Substrate: ${inputs.substrate}`, 14, 56);
    doc.text(`Wind load: ${inputs.windLoad}`, 14, 64);
    doc.text(`Joint size: ${inputs.jointSize}"`, 14, 72);

    doc.text(`Clips: ${results.clips}`, 14, 88);
    doc.text(`Fasteners (${results.fastenerType}): ${results.screws}`, 14, 96);
    doc.text(`Sealant tubes: ${results.sealant}`, 14, 104);
    doc.text(`Trim (ft): ${results.trim}`, 14, 112);
    doc.setFontSize(13);
    doc.text(`Estimated total: ${currency.format(results.totalCost)}`, 14, 124);

    doc.save("acm-installation-kit-estimate.pdf");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Installment Kit Configurator
        </h1>
        <p className="mt-2 text-[15px] text-gray-600">
          Enter panel details to estimate clips, fasteners, sealant, trim, and total cost.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Panel Width (in)</span>
            <input
              type="number"
              min={1}
              name="panelWidth"
              value={inputs.panelWidth}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Panel Height (in)</span>
            <input
              type="number"
              min={1}
              name="panelHeight"
              value={inputs.panelHeight}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Number of Panels</span>
            <input
              type="number"
              min={1}
              name="panelCount"
              value={inputs.panelCount}
              onChange={handleChange}
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
