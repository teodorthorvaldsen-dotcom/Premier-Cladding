"use client";

import { useState } from "react";
import Image from "next/image";
import type { MetalSystemCategory } from "@/data/metalSystems";

type MetalSystemItem = MetalSystemCategory["items"][number];

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] ?? "") + (words[1][0] ?? "");
  }
  return name.slice(0, 2).toUpperCase() || "—";
}

interface MetalSystemCardProps {
  item: MetalSystemItem;
  onAddToEstimate: (configKey: string) => void;
}

export function MetalSystemCard({ item, onAddToEstimate }: MetalSystemCardProps) {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(item.name);

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gray-50">
        {!imageError ? (
          <Image
            src={item.image}
            alt=""
            fill
            className="object-contain"
            sizes="(min-width: 1280px) 280px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400"
            aria-hidden
          >
            <span className="text-2xl font-semibold tracking-tight">
              {initials}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
        <p className="mt-1 text-[13px] leading-snug text-gray-600">
          {item.short}
        </p>
        {item.tags && item.tags.length > 0 && (
          <p className="mt-2 text-[11px] text-gray-500">
            {item.tags.join(" · ")}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onAddToEstimate(item.configKey)}
            className="rounded-lg bg-gray-900 px-3 py-2 text-[12px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Add to Estimate
          </button>
          <a
            href={item.specUrl ?? "#specs"}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            View Specs
          </a>
        </div>
      </div>
    </article>
  );
}
