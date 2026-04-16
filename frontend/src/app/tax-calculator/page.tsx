"use client";

import Link from "next/link";
import { useState } from "react";

import { TaxCalculator } from "@/components/tax/TaxCalculator";
import { ALL_PROFESSIONS } from "@/data/expenseCategories";

export default function TaxCalculatorPage() {
  const [profession, setProfession] = useState(
    ALL_PROFESSIONS[0] ?? "Taxi Driver",
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-black/10 bg-white/80 shadow-sm shadow-black/[0.04] backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-4 min-[900px]:px-10">
          <Link
            href="/"
            className="text-sm font-semibold text-brand-green underline-offset-4 hover:underline"
          >
            ← Home
          </Link>
          <span className="text-sm font-medium text-brand-muted">
            Tax calculator
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-content px-5 py-8 min-[900px]:px-10 min-[900px]:py-10">
        <h1 className="text-2xl font-bold text-brand-black min-[900px]:text-3xl">
          Self-employed tax estimate
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted min-[900px]:text-base">
          Enter turnover and costs in the card, pick pay period and tax year,
          then open options for student loan or pension — similar flow to
          popular UK tax calculator sites (estimate only).
        </p>

        <div className="mt-8 max-w-xl">
          <label
            htmlFor="tcp-profession"
            className="block text-sm font-semibold text-brand-black"
          >
            Profession (label only)
          </label>
          <select
            id="tcp-profession"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-medium text-brand-black shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/25"
          >
            {ALL_PROFESSIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-10 max-w-3xl">
          <TaxCalculator profession={profession} expenses={[]} />
        </div>
      </div>
    </div>
  );
}
