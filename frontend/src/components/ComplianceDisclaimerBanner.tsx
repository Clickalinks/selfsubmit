import { ShieldCheck } from "lucide-react";

const DISCLAIMER =
  "SelfSubmit is designed to help you stay compliant with HMRC Making Tax Digital requirements. You remain responsible for ensuring the information you submit is accurate.";

type Props = {
  className?: string;
};

export function ComplianceDisclaimerBanner({ className = "" }: Props) {
  return (
    <div
      className={`border-b border-brand-green/15 bg-brand-mint/80 px-4 py-2.5 text-brand-forest backdrop-blur-sm ${className}`}
      role="note"
      aria-label="HMRC compliance notice"
    >
      <p className="mx-auto flex max-w-6xl items-start justify-center gap-2 text-center text-xs leading-relaxed sm:items-center sm:text-sm">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-green sm:mt-0" aria-hidden />
        <span>{DISCLAIMER}</span>
      </p>
    </div>
  );
}
