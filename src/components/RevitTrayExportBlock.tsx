"use client";

import { useMemo, useState } from "react";
import { normalizeBoxTraySides } from "@/lib/boxTray";
import { buildTrayPanelDxf } from "@/lib/trayPanelDxf";
import {
  formatRevitTrayExportCsv,
  formatRevitTrayExportJson,
  REVIT_TRAY_SCHEMA,
} from "@/lib/revitTrayExport";
import type { CartItem } from "@/types/cart";

function downloadTextFile(text: string, filename: string, mime: string): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeDxfFilename(id: string): string {
  const base = id.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "") || "panel";
  return `all-cladding-tray-${base.slice(0, 48)}.dxf`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function RevitTrayExportBlock({ item }: { item: CartItem }) {
  const [tab, setTab] = useState<"json" | "csv" | "dxf">("dxf");
  const [copied, setCopied] = useState(false);
  const trayNorm = useMemo(
    () => (item.boxTraySides?.length ? normalizeBoxTraySides(item.boxTraySides) : []),
    [item.boxTraySides]
  );
  const json = useMemo(
    () => formatRevitTrayExportJson(item.widthIn, item.heightIn, trayNorm),
    [item.widthIn, item.heightIn, trayNorm]
  );
  const csv = useMemo(
    () => formatRevitTrayExportCsv(item.widthIn, item.heightIn, trayNorm),
    [item.widthIn, item.heightIn, trayNorm]
  );
  const dxf = useMemo(
    () => buildTrayPanelDxf(item.widthIn, item.heightIn, trayNorm),
    [item.widthIn, item.heightIn, trayNorm]
  );

  const text = tab === "json" ? json : tab === "csv" ? csv : "";

  const handleCopy = async () => {
    if (tab === "dxf") return;
    const ok = await copyText(text);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDxf = () => {
    downloadTextFile(dxf, safeDxfFilename(item.id), "image/vnd.dxf");
  };

  return (
    <details className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2">
      <summary className="cursor-pointer text-[13px] font-medium text-indigo-950">
        CAD / BIM export <span className="font-normal text-indigo-800/90">({REVIT_TRAY_SCHEMA})</span>
      </summary>
      <p className="mt-2 text-[11px] leading-snug text-indigo-950/85">
        <strong>DXF</strong> is a flat-pattern outline in <strong>inches</strong> for CAM (e.g.{" "}
        <a
          href="https://www.axyz.com/us/en/software/panelbuilder-software/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-indigo-800 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-950"
        >
          AXYZ PANELBuilder
        </a>{" "}
        batch drawing import). We do not emit native DWG; open the DXF in CAD and save as DWG if your shop requires it.{" "}
        <strong>JSON</strong> / <strong>CSV</strong> stay available for Dynamo, schedules, or custom scripts — flat center
        size is in the first meta rows (CSV) or <code className="rounded bg-white/80 px-1">flatCenter</code> (JSON).
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-indigo-200/80 bg-white p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => setTab("json")}
            className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
              tab === "json" ? "bg-indigo-600 text-white" : "text-indigo-900 hover:bg-indigo-50"
            }`}
          >
            JSON
          </button>
          <button
            type="button"
            onClick={() => setTab("csv")}
            className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
              tab === "csv" ? "bg-indigo-600 text-white" : "text-indigo-900 hover:bg-indigo-50"
            }`}
          >
            CSV
          </button>
          <button
            type="button"
            onClick={() => setTab("dxf")}
            className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
              tab === "dxf" ? "bg-indigo-600 text-white" : "text-indigo-900 hover:bg-indigo-50"
            }`}
          >
            DXF
          </button>
        </div>
        {tab === "dxf" ? (
          <button
            type="button"
            onClick={handleDownloadDxf}
            className="rounded-lg border border-indigo-300 bg-white px-3 py-1 text-[12px] font-medium text-indigo-950 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
          >
            Download .dxf
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="rounded-lg border border-indigo-300 bg-white px-3 py-1 text-[12px] font-medium text-indigo-950 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      {tab === "dxf" ? (
        <p className="mt-2 text-[10px] leading-snug text-indigo-950/75">
          Outline follows the same stacking rules as the site 3D preview (unfolded, 90° layout). Verify bend allowances
          and tooling in PANELBuilder before production.
        </p>
      ) : (
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md border border-indigo-100/90 bg-white p-2 font-mono text-[10px] leading-tight text-gray-800">
          {text}
        </pre>
      )}
    </details>
  );
}
