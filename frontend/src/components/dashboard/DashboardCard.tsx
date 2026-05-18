import type { ReactNode } from "react";

type Props = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardCard({ title, description, children, className = "" }: Props) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 transition-shadow duration-200 hover:shadow-md min-[900px]:p-6 ${className}`}
    >
      {title ? (
        <header className="mb-4 border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 min-[900px]:text-lg">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
