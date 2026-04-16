import Link from "next/link";
import { FileCheck, Play, Send } from "lucide-react";

import { HashLink } from "@/components/landing/HashLink";

const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-8 py-3.5 text-[15px] font-semibold text-white no-underline shadow-btn-green transition hover:brightness-105 hover:shadow-lg active:scale-[0.99]";
const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white/90 px-8 py-3.5 text-[15px] font-semibold text-brand-black no-underline shadow-sm backdrop-blur-sm transition hover:border-black/25 hover:bg-white active:scale-[0.99]";

export function HeroSection() {
  return (
    <section className="bg-transparent px-5 pb-16 pt-12 min-[900px]:px-10 min-[900px]:pb-20 min-[900px]:pt-16">
      <div className="mx-auto flex max-w-prose flex-col items-center text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-green/25 bg-gradient-to-b from-brand-mint to-white px-4 py-2 text-sm font-semibold text-brand-green shadow-sm">
          <FileCheck className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>MTD ready • HMRC recognised</span>
        </div>

        <h1 className="text-balance text-[2rem] font-bold leading-tight tracking-tight text-brand-black min-[900px]:text-[2.75rem] min-[900px]:leading-[1.15]">
          Simple Tax Returns for the Self-Employed.
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-brand-muted min-[900px]:text-lg">
          Easily submit your monthly returns to HMRC in minutes. Pre-filled forms, auto-calculation, and secure
          submission.
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-4 min-[900px]:mt-12 min-[900px]:max-w-none min-[900px]:flex-row min-[900px]:justify-center">
          <HashLink href="/#choose-profession" className={primaryCtaClass}>
            <Send className="h-4 w-4 shrink-0 opacity-95" strokeWidth={2} />
            Get Started Now
          </HashLink>
          <Link href="/tax-calculator" className={secondaryCtaClass}>
            <Play className="h-4 w-4 shrink-0 text-brand-black" fill="currentColor" />
            Tax calculator
          </Link>
        </div>
      </div>
    </section>
  );
}
