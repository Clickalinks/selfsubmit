import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Lightbulb, TriangleAlert } from "lucide-react";

import { HmrcSourceNotice } from "@/components/mtd/HmrcSourceNotice";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { getAllInfoBlockSlugs, getInfoBlockBySlug } from "@/data/mtdInfoBlocks";
import { pageCanonical, defaultOpenGraph, defaultTwitter } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllInfoBlockSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const block = getInfoBlockBySlug(slug);
  if (!block) return { title: "Guide not found" };
  const path = `/mtd/${slug}`;
  return {
    title: `${block.title} — MTD information block | SelfSubmit`,
    description: block.cardIntro,
    alternates: pageCanonical(path),
    openGraph: defaultOpenGraph({
      title: `${block.title} — SelfSubmit`,
      description: block.cardIntro,
      url: path,
      type: "article",
    }),
    twitter: defaultTwitter({
      title: `${block.title} — SelfSubmit`,
      description: block.cardIntro,
    }),
  };
}

export default async function MtdInfoBlockPage({ params }: Props) {
  const { slug } = await params;
  const block = getInfoBlockBySlug(slug);
  if (!block) notFound();

  const Icon = block.icon;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            href="/#mtd-info-blocks"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green hover:text-brand-green-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            All information blocks
          </Link>

          <div className="mt-6 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-mint">
              <Icon className="h-7 w-7 text-brand-green" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-muted">Information block {block.id} of 20</p>
              <h1 className="mt-1 text-3xl font-bold text-brand-black sm:text-4xl">{block.title}</h1>
              <p className="mt-3 text-base leading-relaxed text-brand-muted">{block.cardIntro}</p>
            </div>
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-3">
            {block.highlights.map((point) => (
              <li
                key={point}
                className="rounded-xl border border-brand-green/15 bg-brand-mint/40 px-3 py-2.5 text-xs leading-relaxed text-brand-forest"
              >
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-8">
            <HmrcSourceNotice />

            <section>
              <h2 className="text-xl font-bold text-brand-black">What it is</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-grey sm:text-base">{block.whatItIs}</p>
              {block.additionalDetail ? (
                <p className="mt-3 text-sm leading-relaxed text-brand-grey sm:text-base">{block.additionalDetail}</p>
              ) : null}
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-black">Who it applies to</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-grey sm:text-base">{block.whoItAppliesTo}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-black">What you need to do</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-brand-grey sm:text-base">
                {block.whatYouNeedToDo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-black">Key points</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-brand-grey sm:text-base">
                {block.keyPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            {block.commonMistakes.length > 0 ? (
              <section className="rounded-2xl border border-orange-200 bg-orange-50/80 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <TriangleAlert className="h-5 w-5 text-orange-700" aria-hidden />
                  <h2 className="text-lg font-bold text-orange-950">Common mistakes to avoid</h2>
                </div>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-orange-950/90">
                  {block.commonMistakes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {block.selfSubmitTip ? (
              <section className="rounded-2xl border border-brand-green/20 bg-brand-mint/50 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-brand-green" aria-hidden />
                  <h2 className="text-lg font-bold text-brand-forest">How SelfSubmit helps</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-brand-forest sm:text-base">{block.selfSubmitTip}</p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-brand-black">Further reading</h2>
              <ul className="mt-4 space-y-3">
                {block.hmrcLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:text-brand-green-dark"
                    >
                      {link.label}
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
