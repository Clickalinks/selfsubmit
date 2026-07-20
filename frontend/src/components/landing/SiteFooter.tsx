import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";

import { SelfSubmitLogo } from "@/components/brand/SelfSubmitLogo";
import { FooterCopyright } from "@/components/legal/CompanyDetails";

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
              Making Tax Digital record-keeping software for UK sole traders and landlords.
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

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
            <FooterColumn
              title="Product"
              links={[
                { href: "/", label: "Home" },
                { href: "/features", label: "Features" },
                { href: "/pricing", label: "Pricing" },
                { href: "/business-types", label: "Business types" },
                { href: "/faq", label: "FAQ" },
              ]}
            />
            <FooterColumn
              title="MTD"
              links={[
                { href: "/#mtd-info-blocks", label: "Information blocks" },
                { href: "/blog", label: "Guides & blog" },
                { href: "/how-tax-due-works", label: "How tax due works" },
                { href: "/tax-calculator", label: "Tax calculator" },
                { href: "/hmrc-agent", label: "HMRC agent" },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
                { href: "/partners", label: "Partners" },
                { href: "/security", label: "Security" },
              ]}
            />
            <FooterColumn
              title="Legal"
              links={[
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
                { href: "/cookies", label: "Cookies" },
                { href: "/gdpr", label: "GDPR" },
              ]}
            />
            <FooterColumn
              title="Support"
              links={[
                { href: "/how-it-works", label: "How it works" },
                { href: "/status", label: "Status" },
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Contact" },
              ]}
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-gray-700 pt-8">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Secure payments via Stripe</p>
          <div className="rounded-lg bg-white px-4 py-2 shadow-sm ring-1 ring-black/5 sm:rounded-xl sm:px-5 sm:py-2.5">
            <Image
              src="/payment-methods.png"
              alt="Visa, Mastercard, American Express, Apple Pay, Google Pay, Shop Pay, PayPal, and Samsung Pay"
              width={640}
              height={44}
              className="h-6 w-auto max-w-[min(100%,36rem)] sm:h-7"
              unoptimized
            />
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-6">
          <FooterCopyright />
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
