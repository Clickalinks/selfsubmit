"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en-GB">
      <body className="m-0 font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 text-center">
          <div className="max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-black">Something went wrong</h1>
            <p className="mt-3 text-sm text-neutral-600">
              {error.message || "An unexpected error occurred."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white"
              >
                Try again
              </button>
              <Link
                href="/"
                className="rounded-full border border-black/15 bg-white px-6 py-2.5 text-sm font-semibold text-black"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
