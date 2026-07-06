import type { FaqItem } from "@/data/faqItems";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-slate-200/80 rounded-2xl border border-slate-200/80 bg-white">
      {items.map((item) => (
        <details key={item.id} id={item.id} className="group scroll-mt-28">
          <summary className="cursor-pointer list-none px-5 py-5 text-left font-semibold text-brand-black transition hover:bg-slate-50 sm:px-6 sm:py-6 [&::-webkit-details-marker]:hidden">
            <span className="flex items-start justify-between gap-4">
              <span>{item.question}</span>
              <span
                className="mt-0.5 shrink-0 text-brand-green transition group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </span>
          </summary>
          <div className="border-t border-slate-100 px-5 pb-5 pt-0 text-[15px] leading-relaxed text-brand-muted sm:px-6 sm:pb-6 sm:text-base">
            <p className="pt-4">{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
