import Link from "next/link";

import { LEGAL_POLICIES } from "@/lib/legal-policies";

type Props = {
  /** Highlight the current policy page in the list. */
  currentHref?: string;
};

export function LegalPoliciesNav({ currentHref }: Props) {
  return (
    <nav
      className="mt-10 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-5 min-[900px]:px-5"
      aria-label="Legal policies"
    >
      <p className="text-sm font-bold text-brand-black">Legal policies</p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {LEGAL_POLICIES.map((policy) => (
          <li key={policy.href}>
            {policy.href === currentHref ? (
              <span className="font-semibold text-brand-black" aria-current="page">
                {policy.label}
              </span>
            ) : (
              <Link href={policy.href} className="text-brand-green underline-offset-2 hover:underline">
                {policy.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
