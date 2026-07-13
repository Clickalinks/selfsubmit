import Image from "next/image";

type SelfSubmitLogoProps = {
  /** `light` = white wordmark on dark backgrounds; `dark` = dark text on white */
  variant?: "light" | "dark";
  className?: string;
  showWordmark?: boolean;
  /** Smaller mark for narrow mobile headers */
  compact?: boolean;
};

export function SelfSubmitLogo({
  variant = "dark",
  className = "",
  showWordmark = true,
  compact = false,
}: SelfSubmitLogoProps) {
  const isLight = variant === "light";
  const textClass = isLight ? "text-white" : "text-brand-black";

  const iconSize = compact ? "h-9 w-9" : "h-10 w-10 sm:h-11 sm:w-11";
  const iconPx = compact ? 36 : 44;
  const wordSize = compact ? "text-lg sm:text-2xl" : "text-xl sm:text-2xl";

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 sm:gap-2.5 ${className}`}>
      <span className={`relative shrink-0 ${iconSize}`} aria-hidden>
        <Image
          src="/brand/selfsubmit-logo.png"
          alt=""
          width={iconPx}
          height={iconPx}
          className="h-full w-full object-contain"
          priority={variant === "dark"}
          unoptimized
        />
      </span>
      {showWordmark ? (
        <span className={`truncate font-bold tracking-tight ${wordSize} ${textClass}`}>
          Self<span className="text-brand-green">Submit</span>
        </span>
      ) : null}
    </span>
  );
}
