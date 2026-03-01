"use client";

import { useState } from "react";
import { METAL_SYSTEM_CATEGORIES } from "@/data/metalSystems";
import { MetalSystemCard } from "./MetalSystemCard";

interface MetalSystemsBrowserProps {
  onAddToEstimate: (configKey: string) => void;
}

export function MetalSystemsBrowser({ onAddToEstimate }: MetalSystemsBrowserProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    METAL_SYSTEM_CATEGORIES[0]?.id ?? ""
  );

  const category = METAL_SYSTEM_CATEGORIES.find((c) => c.id === selectedCategoryId);

  return (
    <section
      className="border-t border-gray-200 py-10 sm:py-12 lg:py-14"
      aria-labelledby="systems-browser-heading"
    >
      <div className="mb-8">
        <h2
          id="systems-browser-heading"
          className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl"
        >
          Systems
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
          Browse by category and add a system to the configurator below for a budgetary estimate.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {METAL_SYSTEM_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
              selectedCategoryId === cat.id
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {category && (
        <div className="mt-6">
          {category.description && (
            <p className="mb-6 max-w-2xl text-[13px] text-gray-600">
              {category.description}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.items.map((item) => (
              <MetalSystemCard
                key={item.id}
                item={item}
                onAddToEstimate={onAddToEstimate}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
