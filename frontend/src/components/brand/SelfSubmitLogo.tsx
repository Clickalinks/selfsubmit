import Image from "next/image";

type SelfSubmitLogoProps = {
  /** `light` = white plate behind logo on dark backgrounds; `dark` = logo as-is on light backgrounds */
  variant?: "light" | "dark";
  className?: string;
  /** Kept for API compatibility — confirmed asset already includes the wordmark */
  showWordmark?: boolean;
  /** Smaller mark for narrow mobile headers */
  compact?: boolean;
};

/**
 * Confirmed SelfSubmit lockup (green check + SelfSubmit wordmark).
 * Source of truth: /brand/selfsubmit-logo.png
 */
export function SelfSubmitLogo({
  variant = "dark",
  className = "",
  showWordmark: _showWordmark = true,
  compact = false,
}: SelfSubmitLogoProps) {
  const heightClass = compact ? "h-8 sm:h-9" : "h-9 sm:h-11";
  const widthPx = compact ? 140 : 180;
  const heightPx = compact ? 32 : 44;
  const plate =
    variant === "light"
      ? "rounded-md bg-white px-1.5 py-1 shadow-sm ring-1 ring-black/5"
      : "";

  return (
    <span className={`inline-flex min-w-0 items-center ${className}`}>
      <span className={`relative inline-flex items-center ${plate}`}>
        <Image
          src="/brand/selfsubmit-logo.png"
          alt="SelfSubmit"
          width={widthPx}
          height={heightPx}
          className={`${heightClass} w-auto max-w-[min(100%,11rem)] object-contain object-left`}
          priority
          unoptimized
        />
      </span>
    </span>
  );
}
