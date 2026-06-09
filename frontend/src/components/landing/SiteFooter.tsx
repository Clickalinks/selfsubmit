import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";

import { SelfSubmitLogo } from "@/components/brand/SelfSubmitLogo";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const linkClass = "text-sm text-gray-300 transition hover:text-brand-green";

export function SiteFooter() {
  return (
    <footer className="relative z-20 mt-auto w-full border-t border-white/10 bg-[#1a1d1f] text-white">
      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_2fr] lg:gap-14">
          <div>
            <Link href="/" className="inline-block" aria-label="SelfSubmit home">
              <SelfSubmitLogo variant="light" className="scale-100 sm:scale-105" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-400">
              Simple tax returns and MTD guidance for self-employed people and landlords across the UK.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
                { label: "X", href: "https://x.com", Icon: XIcon },
                { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
                { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
              ].map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-gray-200 transition hover:border-brand-green hover:bg-brand-green/10 hover:text-brand-green"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterColumn
              title="Quick links"
              links={[
                { href: "/", label: "Home" },
                { href: "/how-it-works", label: "How it works" },
                { href: "/pricing", label: "Pricing" },
                { href: "/sign-up", label: "Sign up" },
              ]}
            />
            <FooterColumn
              title="MTD"
              links={[
                { href: "/mtd", label: "MTD categories" },
                { href: "/submit", label: "Monthly submission" },
                { href: "/tax-calculator", label: "Tax calculator" },
                { href: "/hmrc-agent", label: "HMRC agent" },
              ]}
            />
            <FooterColumn
              title="Features"
              links={[
                { href: "/dashboard/receipts", label: "Receipts" },
                { href: "/dashboard/submissions", label: "Submissions" },
                { href: "/add-business", label: "Add business" },
                { href: "/about", label: "About" },
              ]}
            />
            <FooterColumn
              title="Support"
              links={[
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
                { href: "/accessibility", label: "Accessibility" },
              ]}
            />
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 text-center">
          <p className="text-xs text-gray-500 sm:text-sm">
            Selfsubmit.co.uk is part of Clicado Media UK Ltd. © {new Date().getFullYear()} SelfSubmit.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-bold text-white">{title}</p>
      <ul className="mt-3 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
