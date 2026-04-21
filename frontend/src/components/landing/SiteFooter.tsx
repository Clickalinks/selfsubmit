import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/80 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/70 px-5 py-8 min-[900px]:px-10">
      <div className="mx-auto max-w-content">
        <div className="flex flex-col gap-6 min-[900px]:flex-row min-[900px]:justify-between min-[900px]:gap-10">
          <div>
            <p className="text-sm font-semibold text-brand-black">SelfSubmit</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-brand-muted">
              UK self-employed income &amp; expenses — built for clarity. Some features are demo or illustrative; see{" "}
              <Link href="/disclaimer" className="text-brand-green underline underline-offset-2 hover:no-underline">
                disclaimer
              </Link>
              .
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm sm:grid-cols-3" aria-label="Site and legal">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-black/70">Product</p>
              <ul className="mt-3 space-y-2 text-brand-muted">
                <li>
                  <Link href="/how-it-works" className="transition hover:text-brand-green">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="transition hover:text-brand-green">
                    About us
                  </Link>
                </li>
                <li>
                  <Link href="/tax-calculator" className="transition hover:text-brand-green">
                    Tax calculator
                  </Link>
                </li>
                <li>
                  <Link href="/submit" className="transition hover:text-brand-green">
                    Monthly form
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition hover:text-brand-green">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/sign-in" className="transition hover:text-brand-green">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-black/70">Legal &amp; trust</p>
              <ul className="mt-3 space-y-2 text-brand-muted">
                <li>
                  <Link href="/privacy" className="transition hover:text-brand-green">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="transition hover:text-brand-green">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="transition hover:text-brand-green">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="/gdpr" className="transition hover:text-brand-green">
                    GDPR &amp; data
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className="transition hover:text-brand-green">
                    Disclaimer &amp; illustrations
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="transition hover:text-brand-green">
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-black/70">HMRC</p>
              <ul className="mt-3 space-y-2 text-brand-muted">
                <li>
                  <Link href="/hmrc-agent" className="transition hover:text-brand-green">
                    Recognised agent
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.gov.uk"
                    className="transition hover:text-brand-green"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GOV.UK
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 border-t border-slate-200/80 pt-6 min-[900px]:mt-12 min-[900px]:pt-7">
          <p className="mx-auto max-w-4xl text-center text-[11px] leading-relaxed text-brand-muted min-[900px]:text-xs">
            © 2026 SelfSubmit. Clicado Media UK Ltd. “MTD compliant” reflects product direction for a future filing path —
            not a guarantee for this demo.
          </p>
        </div>
      </div>
    </footer>
  );
}
