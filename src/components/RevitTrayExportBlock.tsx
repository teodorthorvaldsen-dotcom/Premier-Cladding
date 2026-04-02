"use client";

import { useMemo, useState } from "react";
import { normalizeBoxTraySides } from "@/lib/boxTray";
import {
  formatRevitTrayExportCsv,
  formatRevitTrayExportJson,
  REVIT_TRAY_SCHEMA,
} from "@/lib/revitTrayExport";
import type { CartItem } from "@/types/cart";

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
  const [tab, setTab] = useState<"json" | "csv">("json");
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

  const text = tab === "json" ? json : csv;

  const handleCopy = async () => {
    const ok = await copyText(text);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <details className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2">
      <summary className="cursor-pointer text-[13px] font-medium text-indigo-950">
        Revit / BIM export <span className="font-normal text-indigo-800/90">({REVIT_TRAY_SCHEMA})</span>
      </summary>
      <p className="mt-2 text-[11px] leading-snug text-indigo-950/85">
        Use <strong>JSON</strong> in Dynamo (<code className="rounded bg-white/80 px-1">String → JSON.Parse</code>) or
        scripting; use <strong>CSV</strong> for schedule import or spreadsheet workflows. Flat center size is in the first
        meta rows (CSV) or <code className="rounded bg-white/80 px-1">flatCenter</code> (JSON).
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
        </div>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="rounded-lg border border-indigo-300 bg-white px-3 py-1 text-[12px] font-medium text-indigo-950 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md border border-indigo-100/90 bg-white p-2 font-mono text-[10px] leading-tight text-gray-800">
        {text}
      </pre>
    </details>
  );
}
