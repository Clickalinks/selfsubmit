import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { HmrcSourceNotice } from "@/components/mtd/HmrcSourceNotice";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { getAllCategorySlugs, getCategoryBySlug } from "@/data/mtdCategoryContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.title} — MTD guide | SelfSubmit`,
    description: category.summary,
  };
}

export default async function MtdCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const Icon = category.icon;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            href="/#mtd-categories"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green hover:text-brand-green-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            All MTD categories
          </Link>

          <div className="mt-6 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-mint">
              <Icon className="h-7 w-7 text-brand-green" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-muted">Category {category.id}</p>
              <h1 className="mt-1 text-3xl font-bold text-brand-black sm:text-4xl">{category.title}</h1>
              <p className="mt-3 text-base leading-relaxed text-brand-muted">{category.summary}</p>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            <HmrcSourceNotice />

            <section>
              <h2 className="text-xl font-bold text-brand-black">What it is</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-grey sm:text-base">{category.whatItIs}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-black">Who it applies to</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-grey sm:text-base">{category.whoItAppliesTo}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-black">What you need to do</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-brand-grey sm:text-base">
                {category.whatYouNeedToDo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-black">Key points</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-brand-grey sm:text-base">
                {category.keyPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-brand-black">Official HMRC links</h2>
              <ul className="mt-4 space-y-3">
                {category.hmrcLinks.map((link) => (
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
