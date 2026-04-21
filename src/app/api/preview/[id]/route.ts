import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";

export const runtime = "nodejs";

function safeId(id: string): string | null {
  if (!/^[a-zA-Z0-9_-]{6,120}$/.test(id)) return null;
  return id;
}

function contentTypeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
    default:
      return "image/jpeg";
  }
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: raw } = await ctx.params;
  const id = safeId(raw);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Stored by /api/quote/cart from data URLs for email previews.
  const dir = path.join(process.cwd(), "data", "email-previews");
  const candidates = [".jpg", ".jpeg", ".png", ".webp"].map((ext) => path.join(dir, `${id}${ext}`));

  for (const filePath of candidates) {
    try {
      const buf = await readFile(filePath);
      const ext = path.extname(filePath);
      return new NextResponse(buf, {
        headers: {
          "Content-Type": contentTypeFromExt(ext),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // try next extension
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

