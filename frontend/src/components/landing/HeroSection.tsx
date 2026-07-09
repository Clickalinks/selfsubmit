import Image from "next/image";
import Link from "next/link";
import { CirclePlay } from "lucide-react";

const primaryCtaClass =
  "inline-flex w-full min-[480px]:w-auto items-center justify-center rounded-2xl bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-10 py-4 text-base font-semibold text-white no-underline shadow-[0_8px_28px_rgba(0,176,80,0.38),0_1px_0_rgba(255,255,255,0.2)_inset] transition hover:brightness-[1.03] hover:shadow-[0_12px_36px_rgba(0,176,80,0.42)] active:scale-[0.99]";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/60 bg-[#f4f5f7] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 55% at 100% 0%, rgba(59, 130, 246, 0.09), transparent 52%),
            radial-gradient(ellipse 70% 50% at 0% 100%, rgba(0, 176, 80, 0.07), transparent 50%),
            linear-gradient(180deg, #fafbfc 0%, #f4f5f7 45%, #eef0f3 100%)
          `,
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-start gap-8 sm:gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-12 xl:gap-14">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="max-w-xl text-balance text-[1.75rem] font-bold leading-[1.12] tracking-tight text-[#1D2B45] sm:text-[2rem] lg:text-[2.65rem] lg:leading-[1.08] xl:text-[2.85rem]">
            Simple Tax Returns for the <span className="text-blue-500">Self-Employed</span>
          </h1>

          <p className="mt-4 max-w-md text-pretty text-base font-medium leading-relaxed text-slate-600 sm:mt-5 sm:text-[1.05rem] lg:mt-6 lg:text-lg">
            Keep digital MTD records in minutes — profession-tailored forms, automatic totals, receipt storage, and
            HMRC quarterly updates from your dashboard.
          </p>

          <div className="mt-7 flex w-full max-w-sm flex-col items-stretch gap-4 sm:mt-9 sm:gap-5 lg:mt-11 lg:max-w-none lg:items-start">
            <Link href="/sign-up" className={primaryCtaClass}>
              Get Started Now
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2.5 self-center text-base font-semibold text-[#1D2B45] underline decoration-slate-400/70 underline-offset-[6px] transition hover:decoration-[#1D2B45] lg:self-start"
            >
              <CirclePlay className="h-5 w-5 shrink-0 text-blue-500" strokeWidth={1.75} />
              See how it works
            </Link>
          </div>
        </div>

        <div className="relative w-full lg:pl-1">
          <div className="relative isolate mx-auto aspect-[5/4] w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/50 bg-[#f4f5f7] sm:max-w-lg sm:rounded-3xl lg:mx-0 lg:max-w-none lg:aspect-[3/2] xl:aspect-[8/5]">
            <div className="absolute inset-0 z-0 bg-[#f4f5f7]" aria-hidden />
            <Image
              src="/landing/hero-team.png"
              alt="Self-employed professionals — taxi driver, tradesperson, and administrator working together"
              fill
              className="z-[1] object-contain object-center p-3 mix-blend-multiply drop-shadow-[0_16px_36px_rgba(29,43,69,0.12)] sm:p-4 lg:p-6"
              sizes="(min-width: 1280px) 42rem, (min-width: 1024px) 50vw, 100vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
