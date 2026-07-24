export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-is-selfsubmit",
    question: "What is SelfSubmit?",
    answer:
      "SelfSubmit is a UK-focused subscription service for self-employed people and landlords who need to keep digital records and send Making Tax Digital (MTD) quarterly updates. It helps you track income and expenses, store receipts, and prepare submissions without complex accounting software.",
  },
  {
    id: "who-is-it-for",
    question: "Who is SelfSubmit for?",
    answer:
      "Anyone who is self-employed or has rental income and needs straightforward monthly record-keeping with profession-specific expense categories — from tradespeople and drivers to freelancers and landlords. You choose your trade when you add a business so the form matches how you work.",
  },
  {
    id: "hmrc-filing",
    question: "Does SelfSubmit file directly with HMRC?",
    answer:
      "SelfSubmit supports Making Tax Digital quarterly updates for self-employment (in-year). Final Declaration is not submitted in SelfSubmit yet — use your HMRC Personal Tax Account or other MTD-compatible software for year-end. We always show clearly when a submission is a draft, sandbox test, or live filing.",
  },
  {
    id: "mtd-income-tax",
    question: "What is MTD for Income Tax?",
    answer:
      "Making Tax Digital for Income Tax (MTD ITSA) requires qualifying self-employed people and landlords to keep digital records, send quarterly updates during the tax year, and complete a final declaration. Thresholds and deadlines are set by HMRC — confirm your obligations on GOV.UK.",
  },
  {
    id: "businesses-per-plan",
    question: "How many businesses can I add?",
    answer:
      "Plans are priced by how many separate businesses (trades or rental streams) you need to manage: Solo (1), Business Plus (2), Professional (3), or Portfolio (4). Each business has its own records and submissions.",
  },
  {
    id: "included-features",
    question: "What is included in every plan?",
    answer:
      "Every plan includes income and expense tracking, receipt and CSV uploads, monthly records for MTD, deadline reminders, submission history, secure document storage, email support, and mobile-friendly access. Quarterly HMRC updates are available when your HMRC account is connected.",
  },
  {
    id: "receipts",
    question: "How do receipt uploads work?",
    answer:
      "You can attach receipts to expense lines in your monthly return. Files are stored securely in your account so you can retrieve them for HMRC’s record-keeping requirements (typically six years).",
  },
  {
    id: "reminders",
    question: "What reminders do you send?",
    answer:
      "We send quarterly deadline reminders by email, and SMS where you have opted in and provided a UK mobile number. Reminders are prompts to review your records — they are not a substitute for checking HMRC deadlines yourself.",
  },
  {
    id: "accountants",
    question: "Can my accountant use SelfSubmit?",
    answer:
      "You can export your records and share submission history with your accountant. We are also exploring formal partner access for bookkeepers and agents — see our Partners page if you would like to register interest.",
  },
  {
    id: "billing",
    question: "How does billing work?",
    answer:
      "Subscriptions are billed monthly through Stripe. You can manage your plan and payment method from your dashboard. If you need to change how many businesses you track, upgrade or downgrade on the pricing page.",
  },
  {
    id: "cancel",
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel your subscription from the billing portal in your dashboard. Your access continues until the end of the current billing period. Export any records you need before closing your account.",
  },
  {
    id: "data-security",
    question: "How is my data protected?",
    answer:
      "We use encrypted connections (HTTPS), secure authentication (including optional multi-factor authentication), and encrypted storage for sensitive tax identifiers. See our Security page and Privacy policy for full details.",
  },
  {
    id: "support",
    question: "How do I get help?",
    answer:
      "Email support@selfsubmit.co.uk for account, billing, or submission questions. We aim to respond within two working days.",
  },
];
