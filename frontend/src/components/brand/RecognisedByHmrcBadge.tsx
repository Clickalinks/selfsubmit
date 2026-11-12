import Image from "next/image";

import { GOVUK_MTD_COMPATIBLE_SOFTWARE_FINDER } from "@/lib/govuk-mtd-links";
import { HMRC_RECOGNISED_TERM, HMRC_SOFTWARE_CHOICES_LISTED } from "@/lib/hmrc-software-choices";

type BadgeSize = "header" | "footer";

/**
 * Light horizontal SelfSubmit mark for the MTD header and site footer.
 * Says “Recognised by HMRC” only after Software Choices listing
 * (`HMRC_SOFTWARE_CHOICES_LISTED`). Until then it is a Making Tax Digital mark.
 */
export function RecognisedByHmrcBadge({ size = "header" }: { size?: BadgeSize }) {
  const listed = HMRC_SOFTWARE_CHOICES_LISTED;
  const label = listed ? `SelfSubmit — ${HMRC_RECOGNISED_TERM}` : "SelfSubmit — Making Tax Digital software";
  const compact = size === "footer";

  const mark = (
    <div
      className={`flex w-full items-center justify-center bg-[#f4faf6] text-center shadow-[inset_0_2px_0_#0c3b2c,inset_0_-2px_0_#0c3b2c,inset_0_4px_0_#f4faf6,inset_0_-4px_0_#f4faf6,inset_0_6px_0_#148a43,inset_0_-6px_0_#148a43] ${
        compact ? "min-h-[3.25rem] px-4 py-2.5" : "min-h-[3.5rem] px-4 py-2.5 sm:min-h-[3.75rem] sm:py-3"
      }`}
      aria-label={label}
    >
      <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-4">
        <Image
          src="/brand/selfsubmit-logo.png"
          alt=""
          width={36}
          height={36}
          className={compact ? "h-7 w-7" : "h-8 w-8 sm:h-9 sm:w-9"}
          unoptimized
        />
        <span
          className={`font-extrabold leading-none tracking-tight text-[#111] ${
            compact ? "text-[15px]" : "text-base sm:text-lg"
          }`}
        >
          Self<span className="text-brand-green">Submit</span>
        </span>
        <span className="text-[#148a43] sm:hidden" aria-hidden>
          ·
        </span>
        <span className="hidden h-5 w-px bg-[#148a43] sm:block" aria-hidden />
        {listed ? (
          <span
            className={`font-extrabold leading-none tracking-tight text-[#0c3b2c] ${
              compact ? "text-[13px]" : "text-sm sm:text-base"
            }`}
          >
            {HMRC_RECOGNISED_TERM}
          </span>
        ) : (
          <span
            className={`font-extrabold leading-none tracking-tight text-[#0c3b2c] ${
              compact ? "text-[13px]" : "text-sm sm:text-base"
            }`}
          >
            Making Tax Digital
          </span>
        )}
      </span>
    </div>
  );

  if (!listed) {
    return mark;
  }

  return (
    <a
      href={GOVUK_MTD_COMPATIBLE_SOFTWARE_FINDER}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full no-underline transition hover:brightness-[0.98]"
    >
      {mark}
    </a>
  );
}
