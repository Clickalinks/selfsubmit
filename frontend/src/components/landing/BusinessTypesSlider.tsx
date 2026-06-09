"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { LANDING_BUSINESSES } from "@/data/landingBusinesses";
import { getProfessionStickerTone } from "@/data/professionStickerTones";
import { stickerCardBg } from "@/data/stickerCardTheme";

const AUTO_MS = 5000;

export function BusinessTypesSlider() {
  const total = LANDING_BUSINESSES.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(next, AUTO_MS);
    return () => window.clearInterval(t);
  }, [next, paused]);

  const business = LANDING_BUSINESSES[index];
  const Icon = business.icon;
  const tone = getProfessionStickerTone(business.trade);

  return (
    <section
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 border-y border-brand-green/15 bg-gradient-to-br from-[#0d5c36] via-[#0f6b3f] to-[#14a44d]"
      aria-label="Business types we support"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative min-h-[320px] w-full sm:min-h-[380px] lg:min-h-[420px]">
        {/* subtle pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1.5px)`,
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />

        <div className="relative flex h-full min-h-[320px] flex-col justify-center px-4 py-10 sm:min-h-[380px] sm:px-8 sm:py-12 lg:min-h-[420px] lg:px-12">
          <div className="mx-auto w-full max-w-6xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-green/90 sm:text-sm">
              Built for UK self-employed
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              {total}+ business types — one simple monthly return
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
              Pick your trade at sign-up. We load the right income and expense lines for HMRC-ready records.
            </p>
          </div>

          <div className="relative mx-auto mt-8 w-full max-w-4xl">
            <div
              className={`flex flex-col items-center gap-6 rounded-3xl border-2 border-white/20 px-6 py-8 shadow-2xl sm:flex-row sm:gap-10 sm:px-10 sm:py-10 ${stickerCardBg(tone)}`}
              key={business.id}
            >
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-[#162436]/20 bg-white/90 shadow-md sm:h-28 sm:w-28">
                <Icon className="h-14 w-14 text-brand-green sm:h-16 sm:w-16" strokeWidth={2} aria-hidden />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-green">Featured trade</p>
                <h3 className="mt-1 text-2xl font-bold text-[#111827] sm:text-3xl">{business.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#374151] sm:text-base">{business.description}</p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <Link
                    href={`/sign-up`}
                    className="inline-flex items-center justify-center rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-btn-green transition hover:bg-brand-green-dark"
                  >
                    Get started — {business.title}
                  </Link>
                  <Link
                    href={`/mtd`}
                    className="inline-flex items-center justify-center rounded-xl border-2 border-[#162436]/25 bg-white/80 px-5 py-3 text-sm font-semibold text-[#162436] transition hover:bg-white"
                  >
                    MTD guides
                  </Link>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={prev}
              className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/95 text-brand-black shadow-lg transition hover:bg-white sm:-left-2 lg:-left-14"
              aria-label="Previous business"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/95 text-brand-black shadow-lg transition hover:bg-white sm:-right-2 lg:-right-14"
              aria-label="Next business"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {LANDING_BUSINESSES.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-8 bg-white" : "w-2 bg-white/45 hover:bg-white/70"
                }`}
                aria-label={`Show ${b.title}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>

          {/* Thumbnail strip — scroll all trades */}
          <div className="mt-8 w-full overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex w-max gap-2 px-1">
              {LANDING_BUSINESSES.map((b, i) => {
                const ThumbIcon = b.icon;
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-left text-xs font-semibold transition sm:text-sm ${
                        i === index
                          ? "border-white bg-white text-brand-green-dark"
                          : "border-white/25 bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <ThumbIcon className="h-4 w-4 shrink-0" aria-hidden />
                      {b.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
