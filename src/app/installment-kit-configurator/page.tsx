"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import { useCart } from "@/context/CartContext";

type Wall = { width: number; height: number };
type Inputs = {
  panelWidth: number;
  panelHeight: number;
  jointSize: number;
  substrate: "metal" | "wood" | "concrete";
  windLoad: "low" | "medium" | "high";
};
type Layout = { cols: number; rows: number; totalPanels: number; waste: number };

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function ACMConfiguratorPro() {
  const router = useRouter();
  const { addItem } = useCart();

  const [walls, setWalls] = useState<Wall[]>([{ width: 240, height: 120 }]);
  const [inputs, setInputs] = useState<Inputs>({
    panelWidth: 48,
    panelHeight: 96,
    jointSize: 0.5,
    substrate: "metal",
    windLoad: "medium",
  });

  const updateWall = (index: number, field: keyof Wall, value: string) => {
    setWalls((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: Number(value) };
      return next;
    });
  };

  const addWall = () => setWalls((prev) => [...prev, { width: 240, height: 120 }]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "substrate" || name === "windLoad") {
      setInputs((prev) => ({ ...prev, [name]: value }));
      return;
    }
    setInputs((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const optimizeLayout = (wall: Wall): Layout => {
    const pW = Number(inputs.panelWidth);
    const pH = Number(inputs.panelHeight);
    const joint = Number(inputs.jointSize);
    if (pW <= 0 || pH <= 0 || wall.width <= 0 || wall.height <= 0) {
      return { cols: 0, rows: 0, totalPanels: 0, waste: 0 };
    }

    const effectiveW = pW + joint;
    const effectiveH = pH + joint;
    const cols = Math.floor((wall.width + joint) / effectiveW);
    const rows = Math.floor((wall.height + joint) / effectiveH);
    const totalPanels = cols * rows;

    const wallArea = wall.width * wall.height;
    const panelArea = totalPanels * (pW * pH);
    const waste = panelArea > 0 ? Math.max(0, Number((((panelArea - wallArea) / panelArea) * 100).toFixed(1))) : 0;
    return { cols, rows, totalPanels, waste };
  };

  const totals = useMemo(() => {
    let totalPanels = 0;
    walls.forEach((wall) => {
      totalPanels += optimizeLayout(wall).totalPanels;
    });

    const perimeter = 2 * (inputs.panelWidth + inputs.panelHeight);
    const spacing = inputs.windLoad === "high" ? 12 : inputs.windLoad === "medium" ? 16 : 24;
    const clipsPerPanel = Math.ceil(perimeter / spacing);
    const clips = totalPanels * clipsPerPanel;
    const screws = clips * 2;
    const sealant = Math.ceil(totalPanels * 0.4);
    const trim = Math.ceil(totalPanels * 12);

    return { panels: totalPanels, clips, screws, sealant, trim };
  }, [walls, inputs.panelWidth, inputs.panelHeight, inputs.windLoad, inputs.jointSize]);

  const pricing = useMemo(
    () => ({
      basic: totals.clips * 2 + totals.screws * 0.15,
      pro: totals.clips * 2 + totals.screws * 0.15 + totals.sealant * 8 + totals.trim * 3,
      premium: totals.clips * 2 + totals.screws * 0.15 + totals.sealant * 10 + totals.trim * 4 + 150,
    }),
    [totals]
  );

  const warnings = useMemo(() => {
    const out: string[] = [];
    if (totals.panels === 0) out.push("No panels fit given dimensions.");
    walls.forEach((wall) => {
      if (optimizeLayout(wall).waste > 25) out.push("High material waste detected.");
    });
    return [...new Set(out)];
  }, [totals.panels, walls, inputs.panelWidth, inputs.panelHeight, inputs.jointSize]);

  const installHours = Math.ceil(totals.panels / 6);

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ACM Pro Configurator", 14, 18);
    doc.setFontSize(11);
    let y = 30;
    doc.text(`Panel: ${inputs.panelWidth}" x ${inputs.panelHeight}"`, 14, y);
    y += 8;
    doc.text(`Joint size: ${inputs.jointSize}"`, 14, y);
    y += 8;
    doc.text(`Substrate: ${inputs.substrate}`, 14, y);
    y += 8;
    doc.text(`Wind load: ${inputs.windLoad}`, 14, y);
    y += 10;

    walls.forEach((wall, i) => {
      const l = optimizeLayout(wall);
      doc.text(
        `Wall ${i + 1}: ${wall.width}" x ${wall.height}" -> ${l.cols} x ${l.rows}, ${l.totalPanels} panels, ${l.waste}% waste`,
        14,
        y
      );
      y += 8;
    });

    y += 8;
    doc.text(`Panels: ${totals.panels}`, 14, y);
    y += 8;
    doc.text(`Clips: ${totals.clips}`, 14, y);
    y += 8;
    doc.text(`Screws: ${totals.screws}`, 14, y);
    y += 8;
    doc.text(`Sealant: ${totals.sealant}`, 14, y);
    y += 8;
    doc.text(`Trim (ft): ${totals.trim}`, 14, y);
    y += 8;
    doc.text(`Install Time: ${installHours} hours`, 14, y);
    y += 10;
    doc.setFontSize(13);
    doc.text(`Pro total: ${usd.format(pricing.pro)}`, 14, y);
    doc.save("acm-pro-configurator-estimate.pdf");
  };

  const handleAddToCart = () => {
    const areaFt2 = (inputs.panelWidth * inputs.panelHeight * Math.max(1, totals.panels)) / 144;
    addItem({
      productKind: "acm",
      productLabel: "ACM Pro Configurator Kit",
      widthIn: 1,
      heightIn: 1,
      standardId: null,
      colorId: "classic-white",
      finishId: "standard",
      thicknessId: "4mm",
      quantity: 1,
      unitPrice: Number(pricing.pro.toFixed(2)),
      areaFt2: Number(areaFt2.toFixed(2)),
      panelType: "acm-pro",
      panelTypeLabel: `Pro kit (${totals.panels} panels)`,
      clipsNeeded: totals.clips,
      clipsPerPanel: totals.panels > 0 ? Number((totals.clips / totals.panels).toFixed(2)) : totals.clips,
      trayBuildSpec: walls
        .map((w, i) => {
          const l = optimizeLayout(w);
          return `Wall ${i + 1}: ${w.width}x${w.height} in, layout ${l.cols}x${l.rows}, ${l.totalPanels} panels, ${l.waste}% waste`;
        })
        .join("\n"),
    });
    router.push("/cart");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">ACM Pro Configurator</h1>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input name="panelWidth" type="number" value={inputs.panelWidth} onChange={handleChange} placeholder="Panel Width" className="h-11 rounded-xl border border-gray-200 px-3 text-[15px]" />
          <input name="panelHeight" type="number" value={inputs.panelHeight} onChange={handleChange} placeholder="Panel Height" className="h-11 rounded-xl border border-gray-200 px-3 text-[15px]" />
          <input name="jointSize" type="number" value={inputs.jointSize} onChange={handleChange} placeholder="Joint Size" className="h-11 rounded-xl border border-gray-200 px-3 text-[15px]" />
          <select name="substrate" value={inputs.substrate} onChange={handleChange} className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-[15px]">
            <option value="metal">Metal Studs</option>
            <option value="wood">Wood Framing</option>
            <option value="concrete">Concrete / CMU</option>
          </select>
          <select name="windLoad" value={inputs.windLoad} onChange={handleChange} className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-[15px] sm:col-span-2">
            <option value="low">Low Wind</option>
            <option value="medium">Medium Wind</option>
            <option value="high">High Wind</option>
          </select>
        </div>

        <div className="mt-6 space-y-4">
          {walls.map((wall, i) => {
            const layout = optimizeLayout(wall);
            return (
              <div key={i} className="rounded-xl border border-gray-200 p-4">
                <h2 className="mb-2 font-semibold text-gray-900">Wall {i + 1}</h2>
                <div className="mb-3 flex gap-2">
                  <input type="number" value={wall.width} onChange={(e) => updateWall(i, "width", e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px]" />
                  <input type="number" value={wall.height} onChange={(e) => updateWall(i, "height", e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px]" />
                </div>
                <div className="mb-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(layout.cols, 1)}, minmax(0, 1fr))` }}>
                  {Array.from({ length: layout.totalPanels }).map((_, idx) => (
                    <div key={idx} className="flex h-10 items-center justify-center rounded bg-blue-500 text-xs text-white">Panel</div>
                  ))}
                </div>
                <p className="text-sm text-gray-700">Layout: {layout.cols} x {layout.rows}</p>
                <p className="text-sm text-gray-700">Waste: {layout.waste}%</p>
              </div>
            );
          })}
          <button type="button" onClick={addWall} className="inline-block rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[14px] font-medium text-gray-800 transition hover:bg-gray-50">+ Add Wall</button>
        </div>

        {warnings.length > 0 ? (
          <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-[15px] text-yellow-900">
            {warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900">Basic</h3>
            <p className="mt-1 text-[15px] text-gray-700">{usd.format(pricing.basic)}</p>
          </div>
          <div className="rounded-xl border-2 border-blue-500 p-4">
            <h3 className="font-semibold text-gray-900">Pro (Most Popular)</h3>
            <p className="mt-1 text-[15px] text-gray-700">{usd.format(pricing.pro)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900">Premium</h3>
            <p className="mt-1 text-[15px] text-gray-700">{usd.format(pricing.premium)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Project Summary</h2>
          <p className="mt-2 text-[15px] text-gray-700">Panels: {totals.panels}</p>
          <p className="mt-1 text-[15px] text-gray-700">Clips: {totals.clips}</p>
          <p className="mt-1 text-[15px] text-gray-700">Screws: {totals.screws}</p>
          <p className="mt-1 text-[15px] text-gray-700">Sealant: {totals.sealant}</p>
          <p className="mt-1 text-[15px] text-gray-700">Trim (ft): {totals.trim}</p>
          <p className="mt-1 text-[15px] text-gray-700">Install Time: {installHours} hours</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={handleAddToCart} className="inline-block rounded-xl border border-gray-300 bg-white px-6 py-3 text-[15px] font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">Add to cart</button>
          <button type="button" onClick={exportPdf} className="inline-block rounded-xl bg-gray-900 px-6 py-3 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">Export PDF</button>
        </div>
      </div>
    </div>
  );
}
