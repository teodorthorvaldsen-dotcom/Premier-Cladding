"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

export default function CustomShopDrawingsPage() {
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
    setSelectedFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES));
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
        requestType: "custom-shop-drawings",
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
          throw new Error(typeof json?.error === "string" ? json.error : "Failed to submit.");
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Thank you.</h1>
        <p className="mt-3 text-base text-gray-600">
          We have received your inquiry about custom shop drawings. Our team will respond within 1 business day.
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
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Custom Shop Drawings</h1>
        <p className="mt-2 text-[15px] text-gray-500">
          Inquire about purchasing shop drawings prepared by our team. We can produce fabrication-ready shop drawings for your ACM panel projects.
        </p>
      </div>

      <section className="mb-10 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:p-8">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Examples</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
          Review an example set of custom shop drawings to see typical layouts, callouts, and fabrication-ready details.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href="/documents/Custom-Shop-Drawings-Example-Picken.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl bg-gray-900 px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            View example drawings (PDF)
          </a>
          <span className="text-xs text-gray-500">Opens in a new tab</span>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="border-b border-gray-100 px-6 py-5 md:px-8">
          <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">Inquiry details</h2>
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
              <input type="text" name="fullName" required className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="Full name" />
            </label>
            <label className="block sm:col-span-2">
              <span className="block text-sm font-medium text-gray-900">Company</span>
              <input type="text" name="company" className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="Company" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">Email</span>
              <input type="email" name="email" required className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="email@company.com" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">Phone</span>
              <input type="tel" name="phone" className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="Phone" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">Project city</span>
              <input type="text" name="projectCity" className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="City" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-900">State</span>
              <input type="text" name="projectState" className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="State" />
            </label>
            <label className="block sm:col-span-2">
              <span className="block text-sm font-medium text-gray-900">Desired timeline</span>
              <input type="text" name="desiredTimeline" className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 px-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="e.g. 2 weeks" />
            </label>
          </div>
          <label className="block">
            <span className="block text-sm font-medium text-gray-900">Project description / scope</span>
            <textarea name="notes" rows={4} className="mt-1.5 block min-h-[100px] w-full rounded-xl border border-gray-200 px-3 py-3 text-[15px] focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" placeholder="Describe your project and shop drawing needs (e.g. panel layout, details, quantities)." />
          </label>
          <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-6">
            <span className="block text-sm font-medium text-gray-900">Attach drawings or reference files (optional)</span>
            <p className="mt-0.5 text-xs text-gray-500">PDF, PNG, or JPG. Up to 5 files, 10MB each.</p>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" multiple onChange={handleFileChange} className="sr-only" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 inline-flex rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[15px] font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
              Select files
            </button>
            {selectedFiles.length > 0 && (
              <ul className="mt-3 space-y-2">
                {selectedFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-white px-3 py-2.5 text-[15px]">
                    <span className="truncate text-gray-700">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="ml-2 shrink-0 text-xs font-medium text-red-600 hover:text-red-700">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-5 md:px-8 sm:flex-row sm:justify-end">
          <Link href="/" className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-4 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40">
            {submitting ? "Submitting…" : "Submit inquiry"}
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-[14px] text-gray-500">
        Questions? Email us at{" "}
        <a href="mailto:premiercladdingsolutions@gmail.com" className="font-medium text-gray-900 underline hover:text-gray-700">
          premiercladdingsolutions@gmail.com
        </a>
      </p>
    </div>
  );
}
