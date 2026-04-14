"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";

type Props = {
  images: readonly string[];
  alt?: string;
  autoAdvanceMs?: number;
  className?: string;
};

export function ImageCarousel({ images, alt = "", autoAdvanceMs = 5000, className }: Props) {
  const [idx, setIdx] = useState(0);
  const labelId = useId();

  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const count = safeImages.length;

  useEffect(() => {
    if (count <= 1) return;
    if (!autoAdvanceMs || autoAdvanceMs < 1500) return;
    const t = window.setInterval(() => {
      setIdx((v) => (v + 1) % count);
    }, autoAdvanceMs);
    return () => window.clearInterval(t);
  }, [autoAdvanceMs, count]);

  useEffect(() => {
    if (idx < count) return;
    setIdx(0);
  }, [count, idx]);

  if (count === 0) return null;
  const src = safeImages[idx]!;
  const onPrev = () => setIdx((v) => (v - 1 + count) % count);
  const onNext = () => setIdx((v) => (v + 1) % count);

  return (
    <section
      className={className}
      aria-roledescription="carousel"
      aria-labelledby={labelId}
    >
      <div className="sr-only" id={labelId}>
        Image carousel
      </div>

      <div className="relative aspect-[4/3] min-h-[280px] overflow-hidden rounded-xl bg-gray-200 sm:min-h-[360px]">
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 960px"
          quality={100}
          unoptimized
        />

        {count > 1 ? (
          <>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/55 via-black/25 to-transparent px-4 pb-3 pt-10">
              <p className="text-xs font-medium text-white/90">
                {idx + 1} / {count}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPrev}
                  className="inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
                  aria-label="Previous image"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
                  aria-label="Next image"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

