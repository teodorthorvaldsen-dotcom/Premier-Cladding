import { NextRequest, NextResponse } from "next/server";
import type { PanelType } from "@/lib/pricing";
import {
  allWidths,
  CUSTOM_WIDTH_MAX_IN,
  CUSTOM_WIDTH_MIN_IN,
  maxLengthByThicknessMm,
} from "@/data/acm";
import { calculatePricing } from "@/lib/pricing";

export const runtime = "nodejs";

const MIN_LENGTH_IN = 12;
const VALID_WIDTHS_IN = allWidths.map((w) => w.widthIn);
const VALID_THICKNESS_MM = [4] as const;
const VALID_PANEL_TYPES = ["basic", "basic-no-extrusions", "tray"] as const;

function getMaxLengthIn(thicknessMm: number): number {
  return maxLengthByThicknessMm[thicknessMm] ?? 300;
}

function clampLength(lengthIn: number, thicknessMm: number): number {
  const max = getMaxLengthIn(thicknessMm);
  return Math.min(max, Math.max(MIN_LENGTH_IN, Math.round(Number(lengthIn)) || MIN_LENGTH_IN));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      widthIn: rawWidthIn,
      lengthIn: rawLengthIn,
      thicknessMm: rawThicknessMm,
      colorId,
      qty: rawQty,
      panelType: rawPanelType,
      productKind,
    } = body;

    const kind: "acm" | "flashing" = productKind === "flashing" ? "flashing" : "acm";
    const minWidthIn = kind === "flashing" ? 1 : CUSTOM_WIDTH_MIN_IN;
    const minLengthIn = kind === "flashing" ? 1 : MIN_LENGTH_IN;
    const maxWidthIn = kind === "flashing" ? 48 : CUSTOM_WIDTH_MAX_IN;
    const maxLengthIn = kind === "flashing" ? 120 : undefined;

    const widthIn = Number(rawWidthIn);
    const isStandardWidth = (VALID_WIDTHS_IN as readonly number[]).includes(widthIn);
    const isCustomWidthInRange =
      !Number.isNaN(widthIn) &&
      widthIn >= minWidthIn &&
      widthIn <= maxWidthIn;
    if (!isStandardWidth && !isCustomWidthInRange) {
      return NextResponse.json(
        {
          error: `Invalid width. Width must be between ${minWidthIn} and ${maxWidthIn} in.`,
        },
        { status: 400 }
      );
    }

    const thicknessMm = Number(rawThicknessMm);
    if (!(VALID_THICKNESS_MM as readonly number[]).includes(thicknessMm)) {
      return NextResponse.json(
        { error: "Invalid thickness. Use 4 mm." },
        { status: 400 }
      );
    }

    const lengthNum = rawLengthIn != null ? Number(rawLengthIn) : NaN;
    if (Number.isNaN(lengthNum) || lengthNum < minLengthIn) {
      return NextResponse.json(
        {
          error: `Length must be at least ${minLengthIn} in.`,
        },
        { status: 400 }
      );
    }
    const maxLength = maxLengthIn ?? getMaxLengthIn(thicknessMm);
    if (lengthNum > maxLength) {
      return NextResponse.json(
        {
          error: `Length must be no more than ${maxLength} in for ${thicknessMm} mm thickness.`,
        },
        { status: 400 }
      );
    }
    const lengthIn = Math.min(
      maxLength,
      Math.max(minLengthIn, Math.round(Number(lengthNum)) || minLengthIn)
    );

    const panelType: PanelType =
      rawPanelType === "basic" || rawPanelType === "basic-no-extrusions" || rawPanelType === "tray"
        ? rawPanelType
        : "basic";

    const qty = Math.max(1, Math.floor(Number(rawQty)) || 1);

    const areaFt2 = (widthIn / 12) * (lengthIn / 12);
    const result = calculatePricing({
      areaFt2,
      quantity: qty,
      panelType,
      productKind: kind,
    });

    return NextResponse.json({
      areaFt2: result.areaFt2,
      totalSqFt: result.totalSqFt,
      pricePerSqFt: result.pricePerSqFt,
      total: result.total,
      panelType: result.panelType,
      panelTypeLabel: result.panelTypeLabel,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid request body or server error." },
      { status: 400 }
    );
  }
}
