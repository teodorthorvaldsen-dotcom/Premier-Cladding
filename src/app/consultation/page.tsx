"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

const REQUEST_TYPES = [
  { value: "design-review", label: "Design review & panel specification" },
  { value: "takeoff", label: "Takeoff & quantity estimate" },
  { value: "technical", label: "Technical / detailing support" },
  { value: "other", label: "Other consultation" },
];

export default function ConsultationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setFormError(null);
      setSubmitting(true);
      const form = e.currentTarget;
      const formData = new FormData(form);
      const payload = {
        fullName: formData.get("fullName") ?? "",
        company: formData.get("company") ?? "",
        email: formData.get("email") ?? "",
        phone: formData.get("phone") ?? "",
        projectCity: formData.get("projectCity") ?? "",
        projectState: formData.get("projectState") ?? "",
        desiredTimeline: formData.get("desiredTimeline") ?? "",
        requestType: formData.get("requestType") ?? "",
        notes: formData.get("notes") ?? "",
      };
      const data = new FormData();
      data.append("payload", JSON.stringify(payload));
      for (const f of selectedFiles) {
        data.append("files", f);
      }
      try {
        const res = await fetch("/api/consultation", {
          method: "POST",
          body: data,
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          const message = typeof json?.error === "string" ? json.error : "Failed to submit consultation request.";
          throw new Error(message);
        }
        setSubmitted(true);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setSubmitting(false);
      }
    },
    [selectedFiles]
  );

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Thank you.</h1>
        <p className="mt-3 text-[15px] text-gray-600">
          We have received your consultation request and will respond within 1 business day.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-gray-900 px-6 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-12">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Cladding Consultation
        </h1>
        <p className="mt-2 text-[15px] text-gray-500">
          Upload plans and request a consultation. Our team, composed of general contractors and structural engineers, will look over your request and get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="border-b border-gray-100 px-6 py-5 md:px-8">
          <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">
            Contact &amp; project details
          </h2>
          <p className="mt-0.5 text-[15px] text-gray-500">We will use this to follow up on your consultation.</p>
        </div>
        <div className="space-y-6 p-6 md:p-8">
          {formError && (
            <div className="rounded-xl bg-red-50/80 px-4 py-3">
              <p className="text-sm text-red-700" role="alert">{formError}</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="block text-sm font-medium text-gray-900">Full name <span className="text-gray-400">*</span></span>
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
              <span className="block text-sm font-medium text-gray-900">Email <span className="text-gray-400">*</span></span>
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
              <span className="block text-sm font-medium text-gray-900">Project city</span>
              <input
                type="text"
                name="projectCity"
                className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                placeholder="City"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">Project state</span>
              <input
                type="text"
                name="projectState"
                className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                placeholder="State"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">Desired timeline</span>
              <input
                type="text"
                name="desiredTimeline"
                className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                placeholder="e.g., Q2 2025, ASAP"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">Request type <span className="text-gray-400">*</span></span>
              <select
                name="requestType"
                required
                className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                <option value="">Select type</option>
                {REQUEST_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium text-gray-900">Notes</span>
            <textarea
              name="notes"
              rows={4}
              className="mt-1.5 block min-h-[100px] w-full rounded-xl border border-gray-200 px-3 py-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              placeholder="Describe your project, panel needs, or questions"
            />
          </label>
          <div>
            <span className="block text-sm font-medium text-gray-900">Upload plans (optional)</span>
            <p className="mt-0.5 text-xs text-gray-500">PDF, PNG, or JPG. Up to 5 files, 10MB each.</p>
            <div className="relative mt-2 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
                onChange={handleFileChange}
                className="absolute h-0 w-0 opacity-0 [-ms-overflow:visible] [overflow:visible]"
                aria-describedby="file-helper"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Choose files
              </button>
              <span id="file-helper" className="text-[15px] text-gray-500" aria-live="polite">
                {selectedFiles.length === 0 ? "No files selected" : `${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""} selected`}
              </span>
            </div>
            {selectedFiles.length > 0 && (
              <ul className="mt-3 space-y-2" aria-live="polite">
                {selectedFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-xl bg-gray-50/80 px-3 py-2.5 text-[15px]">
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
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-5 md:px-8 sm:flex-row sm:justify-end">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Request consultation"}
          </button>
        </div>
      </form>
    </div>
  );
}
