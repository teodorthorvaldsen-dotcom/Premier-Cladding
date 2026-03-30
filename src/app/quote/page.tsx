"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { type QuoteDraft, QUOTE_DRAFT_STORAGE_KEY } from "@/types/quote";

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

function fileFromCustomSpec(
  att: NonNullable<QuoteDraft["customColorSpecAttachment"]>
): File {
  const binary = atob(att.dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], att.fileName, {
    type: att.mimeType || "application/pdf",
  });
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

export default function QuotePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<QuoteDraft | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"wire" | "credit">("wire");
  const [signature, setSignature] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ORDER_STEPS = [
    "We receive your order.",
    "A copy is sent to us at allcladdingsolutions@gmail.com.",
    "Email confirmation is sent to you.",
    "We check inventory and prepare your estimate.",
    "We send you the finalized cost for your signature.",
    "We order materials and ship to our shop.",
    "Panels are fabricated.",
    "Once complete, you have 5 business days to pay the final deposit.",
    "Upon receipt of payment, we ship to you.",
  ];

  const TERMS_URL = "/documents/All_Cladding_ACM_Panel_Pre_Estimate_Agreement.html";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(QUOTE_DRAFT_STORAGE_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as QuoteDraft;
      setDraft(parsed);
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    const valid: File[] = [];
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) continue;
      if (f.size > maxBytes) continue;
      valid.push(f);
    }
    setSelectedFiles((prev) => {
      const merged = [...prev, ...valid].slice(0, MAX_FILES);
      return merged;
    });
    e.target.value = "";
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!draft) return;
      if (!signature.trim()) {
        setFormError("Please provide your electronic signature.");
        return;
      }
      setFormError(null);
      setSubmitting(true);
      const form = e.currentTarget;
      const formData = new FormData(form);
      const safeConfig: QuoteDraft = { ...draft };
      if (safeConfig.customColorSpecAttachment) {
        safeConfig.customColorSpecAttachment = {
          fileName: safeConfig.customColorSpecAttachment.fileName,
          mimeType: safeConfig.customColorSpecAttachment.mimeType,
          dataBase64: "",
        };
      }
      const payload = {
        config: safeConfig,
        fullName: formData.get("fullName") ?? "",
        company: formData.get("company") ?? "",
        email: formData.get("email") ?? "",
        phone: formData.get("phone") ?? "",
        projectCity: formData.get("projectCity") ?? "",
        projectState: formData.get("projectState") ?? "",
        notes: formData.get("notes") ?? "",
        paymentMethod,
        signature: signature.trim(),
      };
      const data = new FormData();
      data.append("payload", JSON.stringify(payload));
      const drawingFiles: File[] = [];
      if (draft.customColorSpecAttachment) {
        try {
          drawingFiles.push(fileFromCustomSpec(draft.customColorSpecAttachment));
        } catch {
          /* invalid base64 */
        }
      }
      for (const f of selectedFiles) drawingFiles.push(f);
      for (const f of drawingFiles.slice(0, MAX_FILES)) {
        data.append("drawings", f);
      }
      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          body: data,
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          const message = typeof json?.error === "string" ? json.error : "Failed to submit quote request.";
          throw new Error(message);
        }
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(QUOTE_DRAFT_STORAGE_KEY);
        }
        setSubmitted(true);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setSubmitting(false);
      }
    },
    [draft, selectedFiles, paymentMethod, signature]
  );

  if (draft === undefined || (draft === null && !submitted)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Thank you.</h1>
        <p className="mt-3 text-base text-gray-600">
          Our team will review your request and respond within 1 business day.
        </p>
        <a
          href="/products/acm-panels"
          className="mt-8 inline-block rounded-xl bg-gray-900 px-6 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Return to configurator
        </a>
      </div>
    );
  }

  if (!draft) return null;

  const isMetal = draft.productKind === "metal";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Request Final Quote</h1>
        <p className="mt-2 text-[15px] text-gray-500">
          Review your configuration and submit your details.
        </p>
      </div>

      <section className="mb-10 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-8">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Quote Summary</h2>
        {!isMetal && (
          <>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              {draft.panelTypeLabel && (
                <div>
                  <dt className="text-gray-500">Panel type</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">{draft.panelTypeLabel}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Width</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{draft.widthLabel}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Length</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{draft.lengthIn} in</dd>
              </div>
              <div>
                <dt className="text-gray-500">Thickness</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{draft.thicknessLabel}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Finish</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{draft.finishLabel}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Color</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{draft.colorName} ({draft.colorCode})</dd>
              </div>
              {draft.customColorReference ? (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Color reference</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap font-medium text-gray-900">
                    {draft.customColorReference}
                  </dd>
                </div>
              ) : null}
              {draft.customColorSpecAttachment ? (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Custom color PDF</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">
                    {draft.customColorSpecAttachment.fileName} (submitted with request)
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-gray-500">Quantity</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{draft.quantity} panels</dd>
              </div>
              <div>
                <dt className="text-gray-500">Total sq ft</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{draft.totalSqFt.toFixed(2)} ft²</dd>
              </div>
              <div>
                <dt className="text-gray-500">Estimated total</dt>
                <dd className="mt-0.5 font-semibold text-gray-900">{formatUSD(draft.estimatedTotal)}</dd>
              </div>
            </dl>
          </>
        )}
        {isMetal && (
          <>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              {draft.metalSystemLabel && (
                <div>
                  <dt className="text-gray-500">System</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">{draft.metalSystemLabel}</dd>
                </div>
              )}
              {draft.metalMaterial && (
                <div>
                  <dt className="text-gray-500">Material</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">{draft.metalMaterial}</dd>
                </div>
              )}
              {draft.metalGauge && (
                <div>
                  <dt className="text-gray-500">Gauge / thickness</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">{draft.metalGauge}</dd>
                </div>
              )}
              {draft.metalFinishCategory && (
                <div>
                  <dt className="text-gray-500">Finish category</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">{draft.metalFinishCategory}</dd>
                </div>
              )}
              {draft.metalColorName && draft.metalColorCode && (
                <div>
                  <dt className="text-gray-500">Color</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">
                    {draft.metalColorName} ({draft.metalColorCode})
                  </dd>
                </div>
              )}
              {typeof draft.metalTotalSqFt === "number" && (
                <div>
                  <dt className="text-gray-500">Total wall area</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">
                    {draft.metalTotalSqFt.toFixed(0)} ft²
                  </dd>
                </div>
              )}
              {typeof draft.metalPricePerSqFt === "number" && (
                <div>
                  <dt className="text-gray-500">Estimated price / ft²</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">
                    {formatUSD(draft.metalPricePerSqFt)}
                  </dd>
                </div>
              )}
              {typeof draft.metalMaterialSubtotal === "number" && (
                <div>
                  <dt className="text-gray-500">Material subtotal</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">
                    {formatUSD(draft.metalMaterialSubtotal)}
                  </dd>
                </div>
              )}
              {typeof draft.metalLaborSubtotal === "number" && (
                <div>
                  <dt className="text-gray-500">Labor subtotal</dt>
                  <dd className="mt-0.5 font-medium text-gray-900">
                    {formatUSD(draft.metalLaborSubtotal)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Estimated total</dt>
                <dd className="mt-0.5 font-semibold text-gray-900">
                  {formatUSD(draft.estimatedTotal)}
                </dd>
              </div>
            </dl>
          </>
        )}
        <p className="mt-4 border-t border-gray-100 pt-4 text-[14px] text-gray-500">
          <span className="font-medium text-gray-600">Disclaimer:</span> Estimated costs are for reference only and are subject to change. Final pricing and lead times will be confirmed in your written quote.
        </p>
        {!isMetal && draft.customColorSpecOversizeFileName ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-[15px] text-amber-950">
            <span className="font-medium">Large PDF:</span>{" "}
            <span className="break-all">{draft.customColorSpecOversizeFileName}</span> was not pre-attached
            (over 1 MB). Please upload it under drawings below so we receive your full specification.
          </div>
        ) : null}
      </section>

      <section className="mb-10 rounded-2xl border border-gray-200/80 bg-gray-50/50 p-6 md:p-8">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Order process</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-4 text-[14px] text-gray-700">
          {ORDER_STEPS.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mb-10 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-6 md:p-8">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-amber-800">Payment</h2>
        <p className="mt-2 text-[14px] text-gray-700">
          Once your quote is final and approved by you, a 50% deposit is required. The remainder is due upon shipping.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="paymentMethod" value="wire" checked={paymentMethod === "wire"} onChange={() => setPaymentMethod("wire")} className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-400" />
            <span className="text-[15px] font-medium text-gray-900">Wire transfer</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="paymentMethod" value="credit" checked={paymentMethod === "credit"} onChange={() => setPaymentMethod("credit")} className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-400" />
            <span className="text-[15px] font-medium text-gray-900">Credit card (3% fee)</span>
          </label>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="border-b border-gray-100 px-6 py-5 md:px-8">
          <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">
            Contact &amp; project details
          </h2>
          <p className="mt-0.5 text-[15px] text-gray-500">We&apos;ll use this to send your quote.</p>
        </div>
        <div className="space-y-6 p-6 md:p-8">
          {formError && (
            <div className="rounded-xl bg-red-50/80 px-4 py-3">
              <p className="text-sm text-red-700" role="alert">{formError}</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="block text-sm font-medium text-gray-900">Full name</span>
              <input
                type="text"
                name="fullName"
                required
                className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                placeholder="Full name"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="block text-sm font-medium text-gray-900">Company</span>
              <input
                type="text"
                name="company"
                className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                placeholder="Company"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">Email</span>
              <input
                type="email"
                name="email"
                required
                className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                placeholder="email@company.com"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">Phone</span>
              <input
                type="tel"
                name="phone"
                className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                placeholder="Phone"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">City</span>
              <input
                type="text"
                name="projectCity"
                className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                placeholder="Project city"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">State</span>
              <input
                type="text"
                name="projectState"
                className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                placeholder="State"
              />
            </label>
          </div>
          <label className="block">
            <span className="block text-sm font-medium text-gray-900">Notes</span>
            <textarea
              name="notes"
              rows={3}
              className="mt-1.5 block min-h-[88px] w-full rounded-xl border border-gray-200 px-3 py-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              placeholder="Project notes or special requests"
            />
          </label>
          <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-6">
            <div>
              <span className="block text-sm font-medium text-gray-900">Upload drawings (optional)</span>
              <p className="mt-0.5 text-xs text-gray-500">PDF, PNG, or JPG. Up to 5 files, 10MB each.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
                onChange={handleFileChange}
                className="sr-only"
                aria-describedby="file-helper"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[15px] font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Select files
              </button>
              <p id="file-helper" className="mt-2 text-[15px] text-gray-500" aria-live="polite">
                {selectedFiles.length === 0
                  ? "No files chosen"
                  : `${selectedFiles.length} file(s) selected`}
              </p>
              {selectedFiles.length > 0 && (
                <ul className="mt-3 space-y-2" aria-live="polite">
                  {selectedFiles.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-xl bg-white border border-gray-200/80 px-3 py-2.5 text-[15px]">
                      <span className="truncate text-gray-700">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="ml-2 shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                        aria-label={`Remove ${f.name}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-6 border-t border-gray-200/80 pt-6">
              <span className="block text-sm font-medium text-gray-900">Pre-estimate agreement</span>
              <p className="mt-0.5 text-xs text-gray-500">
                By signing below, you agree to the terms of the ACM Panel Pre-Estimate Agreement.
              </p>
              <a
                href={TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-medium text-gray-900 underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
              >
                Read the pre-estimate agreement
                <span className="sr-only">(opens in new tab)</span>
              </a>
              <label className="mt-4 block">
                <span className="block text-sm font-medium text-gray-900">Electronic signature</span>
                <p className="mt-0.5 text-xs text-gray-500">Type your full legal name to sign.</p>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Your full name"
                  className="mt-2 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-5 md:px-8 sm:flex-row sm:justify-end">
          <a
            href={draft.returnUrl ?? "/products/acm-panels"}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Back to configurator
          </a>
          <button
            type="submit"
            disabled={submitting || !signature.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Submit quote request"}
          </button>
        </div>
      </form>
    </div>
  );
}
