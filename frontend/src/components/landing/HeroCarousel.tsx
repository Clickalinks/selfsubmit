"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const SLIDES = [
  {
    image: "/landing/hero-banner.png",
    label: "MTD FOR INCOME TAX",
    title: "Stay MTD Compliant",
    href: "/how-it-works",
  },
  {
    image: "/landing/hero-team.png",
    label: "IMPORTANT DATES",
    title: "Know Your MTD Deadlines",
    href: "/how-it-works",
  },
  {
    image: "/landing/hero-screenshot.png",
    label: "QUARTERLY UPDATES",
    title: "Submit with Confidence",
    href: "/submit",
  },
] as const;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    const timer = window.setInterval(next, 8000);
    return () => window.clearInterval(timer);
  }, [next]);

  return (
    <section className="relative border-b border-slate-200/80 bg-white" aria-label="Hero">
      <div className="relative mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
          <div className="relative aspect-[16/9] min-h-[280px] w-full sm:min-h-[360px] lg:min-h-[420px]">
            {SLIDES.map((s, i) => (
              <div
                key={s.label}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === index ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <Image
                  src={s.image}
                  alt=""
                  fill
                  className="object-cover"
                  priority={i === 0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/25" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green sm:text-sm">
                    {s.label}
                  </p>
                  <h1 className="mt-2 max-w-xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{s.title}</h1>
                  <Link
                    href={s.href}
                    className="mt-6 inline-flex w-fit items-center justify-center rounded-xl bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-btn-green transition hover:bg-brand-green-dark sm:text-base"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-black shadow-md transition hover:bg-white sm:left-5"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-black shadow-md transition hover:bg-white sm:right-5"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-brand-green" : "w-2.5 bg-white/70 hover:bg-white"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
