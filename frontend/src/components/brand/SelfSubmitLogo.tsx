import { Check } from "lucide-react";

type SelfSubmitLogoProps = {
  /** `light` = white wordmark on dark backgrounds; `dark` = dark text on white */
  variant?: "light" | "dark";
  className?: string;
  showWordmark?: boolean;
};

export function SelfSubmitLogo({
  variant = "dark",
  className = "",
  showWordmark = true,
}: SelfSubmitLogoProps) {
  const isLight = variant === "light";
  const textClass = isLight ? "text-white" : "text-brand-black";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green shadow-btn-green sm:h-11 sm:w-11"
        aria-hidden
      >
        <Check className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={3} />
      </span>
      {showWordmark ? (
        <span className={`text-xl font-bold tracking-tight sm:text-2xl ${textClass}`}>
          Self<span className="text-brand-green">Submit</span>
        </span>
      ) : null}
    </span>
  );
}
