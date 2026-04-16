"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type HashLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

/**
 * Next.js client navigation often skips native hash scrolling. When already on the
 * target path, scroll to the element id and update the URL hash manually.
 */
export function HashLink({ href, className, children }: HashLinkProps) {
  const pathname = usePathname();
  const [pathPart, hashPart] = href.split("#", 2);
  const basePath = pathPart === "" ? "/" : pathPart;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hashPart) return;
    const normalizedBase = basePath === "/" ? "/" : basePath.replace(/\/$/, "");
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "") || "/";
    const samePage =
      normalizedPath === normalizedBase || (normalizedBase === "/" && normalizedPath === "/");

    if (!samePage) return;

    e.preventDefault();
    document.getElementById(hashPart)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${hashPart}`);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} scroll={false}>
      {children}
    </Link>
  );
}
