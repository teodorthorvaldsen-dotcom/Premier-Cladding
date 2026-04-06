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
const VALID_PANEL_TYPES = ["basic", "custom"] as const;

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
    } = body;

    const widthIn = Number(rawWidthIn);
    const isStandardWidth = (VALID_WIDTHS_IN as readonly number[]).includes(widthIn);
    const isCustomWidthInRange =
      !Number.isNaN(widthIn) &&
      widthIn >= CUSTOM_WIDTH_MIN_IN &&
      widthIn <= CUSTOM_WIDTH_MAX_IN;
    if (!isStandardWidth && !isCustomWidthInRange) {
      return NextResponse.json(
        {
          error: `Invalid width. Width must be between ${CUSTOM_WIDTH_MIN_IN} and ${CUSTOM_WIDTH_MAX_IN} in.`,
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
    if (Number.isNaN(lengthNum) || lengthNum < MIN_LENGTH_IN) {
      return NextResponse.json(
        {
          error: `Length must be at least ${MIN_LENGTH_IN} in.`,
        },
        { status: 400 }
      );
    }
    const maxLength = getMaxLengthIn(thicknessMm);
    if (lengthNum > maxLength) {
      return NextResponse.json(
        {
          error: `Length must be no more than ${maxLength} in for ${thicknessMm} mm thickness.`,
        },
        { status: 400 }
      );
    }
    const lengthIn = clampLength(lengthNum, thicknessMm);

    const panelType: PanelType =
      rawPanelType === "basic" || rawPanelType === "custom" ? rawPanelType : "basic";

    const qty = Math.max(1, Math.floor(Number(rawQty)) || 1);

    const areaFt2 = (widthIn / 12) * (lengthIn / 12);
    const result = calculatePricing({
      areaFt2,
      quantity: qty,
      panelType,
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
