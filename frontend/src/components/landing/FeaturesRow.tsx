import { Calculator, FilePenLine, UploadCloud } from "lucide-react";

const FEATURES = [
  {
    title: "Quick & Easy Filing",
    body: "Pre-filled forms tailored for your business. Just review & submit.",
    icon: FilePenLine,
  },
  {
    title: "Auto Calculate Taxes",
    body: "We do the math, you get the right tax. No surprises.",
    icon: Calculator,
  },
  {
    title: "Submit Direct to HMRC",
    body: "Secure and compliant submissions. MTD ready for Income Tax.",
    icon: UploadCloud,
  },
] as const;

export function FeaturesRow() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-transparent px-5 pb-16 min-[900px]:px-10 min-[900px]:pb-20"
      aria-label="How it works"
    >
      <div className="mx-auto max-w-content rounded-[2rem] border border-black/5 bg-gradient-to-b from-brand-mint via-white to-brand-mint px-6 py-12 shadow-panel min-[900px]:rounded-[2.25rem] min-[900px]:px-14 min-[900px]:py-16">
        <div className="grid gap-10 min-[900px]:grid-cols-3 min-[900px]:gap-12">
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
