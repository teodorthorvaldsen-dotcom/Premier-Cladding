import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function StaffLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-gray-500 sm:px-6 lg:px-8">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
