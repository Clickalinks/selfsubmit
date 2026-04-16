"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent px-6 py-12 text-center">
      <div className="max-w-md rounded-2xl border border-black/10 bg-white/85 p-8 shadow-card backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/75">
        <h1 className="text-2xl font-bold text-brand-black">Something went wrong</h1>
        <p className="mt-3 text-sm text-brand-muted">{error.message || "An unexpected error occurred."}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-btn-green hover:brightness-105"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-black/15 bg-white/90 px-6 py-2.5 text-sm font-semibold text-brand-black hover:bg-neutral-50"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
