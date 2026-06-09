import { AlertTriangle } from "lucide-react";

const DISCLAIMER =
  "SelfSubmit is designed to help you stay compliant with HMRC Making Tax Digital requirements. You remain responsible for ensuring the information you submit is accurate.";

type Props = {
  className?: string;
};

export function ComplianceDisclaimerBanner({ className = "" }: Props) {
  return (
    <div
      className={`border-b border-red-200 bg-red-50 px-3 py-2 text-red-900 backdrop-blur-sm supports-[padding:max(0px)]:px-[max(0.75rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(0.75rem,env(safe-area-inset-right))] ${className}`}
      role="note"
      aria-label="HMRC compliance notice"
    >
      <p className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2 px-2 text-center text-xs font-bold leading-snug sm:text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
        <span>{DISCLAIMER}</span>
      </p>
    </div>
  );
}
