import { GOVUK_MTD_COMPATIBLE_SOFTWARE_FINDER } from "@/lib/govuk-mtd-links";
import { HMRC_RECOGNISED_TERM } from "@/lib/hmrc-software-choices";

type MarkSize = "header" | "footer" | "sidebar";

const SIZE: Record<MarkSize, string> = {
  header: "h-10 w-10 sm:h-11 sm:w-11",
  footer: "h-14 w-14 sm:h-[4.25rem] sm:w-[4.25rem]",
  sidebar: "h-12 w-12",
};

/**
 * Official HMRC “MTD ready — Recognised by HMRC” trademark (F2N4QK).
 * Do not recolour. On dark surfaces sit it on a white plate.
 */
export function HmrcMtdRecognisedMark({
  size = "footer",
  onDark = false,
}: {
  size?: MarkSize;
  onDark?: boolean;
}) {
  const mark = (
    <img
      src="/brand/hmrc-mtd-recognised.svg"
      alt={`MTD ready. ${HMRC_RECOGNISED_TERM}`}
      className={`${SIZE[size]} object-contain`}
    />
  );

  const inner = onDark ? (
    <span className="inline-flex rounded-md bg-white p-1 shadow-sm ring-1 ring-black/10">{mark}</span>
  ) : (
    mark
  );

  return (
    <a
      href={GOVUK_MTD_COMPATIBLE_SOFTWARE_FINDER}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 no-underline"
      aria-label={`MTD ready. ${HMRC_RECOGNISED_TERM} — view compatible software on GOV.UK`}
    >
      {inner}
    </a>
  );
}
