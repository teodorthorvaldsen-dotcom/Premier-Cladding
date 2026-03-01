import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const QUOTES_JSONL_PATH = path.join(process.cwd(), "data", "quotes.jsonl");

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = await readFile(QUOTES_JSONL_PATH, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);
    const quotes = lines
      .map((line) => {
        try {
          return JSON.parse(line) as { at: string; [key: string]: unknown };
        } catch {
          return null;
        }
      })
      .filter((q): q is { at: string; [key: string]: unknown } => q !== null)
      .reverse();
    return NextResponse.json({ quotes });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ quotes: [] });
    }
    console.error("[Admin quotes read error]", e);
    return NextResponse.json(
      { error: "Failed to read quotes." },
      { status: 500 }
    );
  }
}
