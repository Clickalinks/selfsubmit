import { Calculator, FilePenLine, UploadCloud } from "lucide-react";

const FEATURES = [
  {
    title: "Save & review records",
    body: "Store monthly income and expenses ready for your quarterly MTD update.",
    icon: FilePenLine,
  },
  {
    title: "Auto Calculate Taxes",
    body: "We do the math, you get the right tax. No surprises.",
    icon: Calculator,
  },
  {
    title: "Built for MTD",
    body: "Digital record-keeping aligned with HMRC rules, with quarterly updates when your HMRC account is connected.",
    icon: UploadCloud,
  },
] as const;

export function FeaturesRow() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-transparent px-4 pb-12 sm:px-6 sm:pb-16 lg:px-10 lg:pb-20"
      aria-label="How it works"
    >
      <div className="mx-auto max-w-content rounded-2xl border border-black/5 bg-gradient-to-b from-brand-mint via-white to-brand-mint px-5 py-10 shadow-panel sm:rounded-[2rem] sm:px-8 sm:py-12 lg:rounded-[2.25rem] lg:px-14 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-12">
          {FEATURES.map(({ title, body, icon: Icon }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-brand-green-bright to-brand-green-dark text-white shadow-md ring-4 ring-white/80">
                <Icon className="h-8 w-8" strokeWidth={1.75} />
              </div>
              <h3 className="mt-6 text-lg font-bold text-brand-black min-[900px]:text-xl">{title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-muted min-[900px]:text-[15px]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
