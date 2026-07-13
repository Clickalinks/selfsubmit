import type { SVGProps } from "react";

/**
 * Brand mark: solid green disc + clear white tick.
 * Circle is inset from the viewBox so scaled edges never clip to a dark fringe.
 */
export function SelfSubmitMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <circle cx="24" cy="24" r="22" fill="#14a44d" />
      <path
        d="M12 24.25 20.25 32.5 36.5 14.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
