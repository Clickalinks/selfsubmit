import { Check, ChevronRight } from "lucide-react";

import { HashLink } from "@/components/landing/HashLink";

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    streamsLabel: "1 income stream",
    streamsDetail: "One business or sole source you track for MTD.",
    price: 8,
    highlights: ["One stream in SelfSubmit", "Profession templates", "Monthly capture & totals"],
    popular: false,
  },
  {
    id: "standard",
    name: "Standard",
    streamsLabel: "2–3 income streams",
    streamsDetail: "Ideal if you run a few trades or side income HMRC treats separately.",
    price: 15,
    popular: true,
    highlights: ["Up to three streams", "Everything in Starter", "Clear split per stream"],
  },
  {
    id: "pro",
    name: "Pro",
    streamsLabel: "4+ income streams",
    streamsDetail: "For complex self-employment with several sources to report.",
    price: 22,
    highlights: ["Unlimited streams (4+)", "Everything in Standard", "Built for heavier MTD use"],
    popular: false,
  },
] as const;

export function PricingBanner() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-transparent px-5 pb-16 min-[900px]:px-10 min-[900px]:pb-20">
      <div className="mx-auto max-w-content rounded-[2rem] bg-gradient-to-b from-brand-black to-neutral-950 px-5 py-12 shadow-xl ring-1 ring-black/5 min-[900px]:rounded-[2.25rem] min-[900px]:px-10 min-[900px]:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green min-[900px]:text-sm">
            Subscriptions
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white min-[900px]:text-3xl">
            Tiered by income streams
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/78 min-[900px]:text-base">
            Instead of charging per business in the abstract, plans follow{" "}
            <strong className="font-semibold text-white">how many income streams</strong> you need to track — the same
            idea as multiple sources of income under MTD for Income Tax. Pick the tier that matches your complexity.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 min-[900px]:mt-12 min-[900px]:grid-cols-3 min-[900px]:gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border px-5 py-6 text-left min-[900px]:px-6 min-[900px]:py-7 ${
                tier.popular
                  ? "border-brand-green/50 bg-gradient-to-b from-white/[0.12] to-white/[0.05] shadow-lg shadow-brand-green/10 ring-1 ring-brand-green/30"
                  : "border-white/15 bg-white/[0.06]"
              }`}
            >
              {tier.popular ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark px-3 py-1 text-xs font-bold text-white shadow-btn-green">
                  Most popular
                </div>
              ) : null}
              <p className="text-xs font-bold uppercase tracking-wide text-brand-green">{tier.name}</p>
              <p className="mt-2 text-lg font-bold text-white min-[900px]:text-xl">{tier.streamsLabel}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{tier.streamsDetail}</p>
              <div className="mt-6 flex items-baseline gap-1 border-t border-white/10 pt-6">
                <span className="text-3xl font-bold tabular-nums text-white min-[900px]:text-4xl">£{tier.price}</span>
                <span className="text-sm font-medium text-white/55">/ month</span>
              </div>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-white/75">
                {tier.highlights.map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-white/55 min-[900px]:text-sm">
          Illustrative tiers for the product roadmap. Final features, limits, and billing terms will be confirmed before
          checkout. Cancel anytime when subscriptions go live.
        </p>

        <div className="mt-8 flex justify-center">
          <HashLink
            href="/#choose-profession"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-white px-8 py-3.5 text-[15px] font-bold text-brand-black no-underline shadow-md transition hover:bg-neutral-100 active:scale-[0.99]"
          >
            Get started
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </HashLink>
        </div>
      </div>
    </section>
  );
}
