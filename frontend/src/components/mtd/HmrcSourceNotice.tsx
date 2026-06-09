import { ExternalLink } from "lucide-react";

export function HmrcSourceNotice() {
  return (
    <aside className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 sm:px-5">
      <p className="font-semibold">Official HMRC guidance</p>
      <p className="mt-2 leading-relaxed text-amber-900/90">
        This page summarises Making Tax Digital rules based on{" "}
        <a
          href="https://www.gov.uk/government/collections/making-tax-digital-for-income-tax"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-semibold text-brand-green underline underline-offset-2 hover:text-brand-green-dark"
        >
          GOV.UK
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        . Tax law and deadlines change — always confirm details on GOV.UK before acting. SelfSubmit is not
        affiliated with HMRC.
      </p>
    </aside>
  );
}
