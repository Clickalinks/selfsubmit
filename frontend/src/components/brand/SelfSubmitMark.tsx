import type { SVGProps } from "react";

/** Brand mark: green disc + stylized white tick. */
export function SelfSubmitMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <circle cx="24" cy="24" r="24" className="fill-brand-green" />
      <path
        d="M7 24.5 18.8 36 41 11"
        stroke="#fff"
        strokeWidth="8"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
