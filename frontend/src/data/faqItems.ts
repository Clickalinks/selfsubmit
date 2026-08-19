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
      "SelfSubmit is a UK subscription service for self-employed people who keep digital records and send Making Tax Digital (MTD) quarterly updates. You can also keep landlord rent and expense records. It helps you track income and expenses, store receipts, and prepare in-year self-employment submissions without complex accounting software.",
  },
  {
    id: "who-is-it-for",
    question: "Who is SelfSubmit for?",
    answer:
      "Anyone who is self-employed and needs straightforward monthly record-keeping with profession-specific expense categories — from tradespeople and drivers to freelancers. Landlords can keep rental records in SelfSubmit too; HMRC quarterly filing for UK property is planned after production approval. You choose your trade when you add a business so the form matches how you work.",
  },
  {
    id: "hmrc-filing",
    question: "Does SelfSubmit file directly with HMRC?",
    answer:
      "SelfSubmit supports Making Tax Digital quarterly updates for self-employment (in-year) when your HMRC account is connected. We always show clearly when a submission is a draft, sandbox test, or live filing. Live production filing depends on HMRC approving this software for that use.",
  },
  {
    id: "uk-property",
    question: "Can I file UK property or landlord income to HMRC?",
    answer:
      "You can keep rent and property cost records in SelfSubmit now. HMRC quarterly filing for UK property (and foreign property) is planned for a later update, after we receive HMRC production approval for that product. Until then, in-year HMRC filing through SelfSubmit is self-employment only. For property MTD filing today, use HMRC’s compatible software list on GOV.UK.",
  },
  {
    id: "mtd-income-tax",
    question: "What is MTD for Income Tax?",
    answer:
      "Making Tax Digital for Income Tax (MTD ITSA) requires qualifying self-employed people and landlords to keep digital records, send quarterly updates during the tax year, and complete a final declaration. Thresholds and deadlines are set by HMRC — confirm your obligations on GOV.UK.",
  },
  {
    id: "vat-final-declaration",
    question: "Do you submit VAT, a Final Declaration, or calculate tax due?",
    answer:
      "No. SelfSubmit does not file VAT returns, does not submit a Final Declaration (year-end), and does not show HMRC’s official tax calculation. After year end, use your HMRC Personal Tax Account or other MTD-compatible software for the Final Declaration and to see what you owe. SelfSubmit’s tax calculator is an indicative estimate only.",
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
      "Every plan includes income and expense tracking, receipt and CSV uploads, monthly records for MTD, deadline reminders, submission history, secure document storage, email support, and mobile-friendly access. In-year HMRC quarterly updates for self-employment are available when your HMRC account is connected.",
  },
  {
    id: "trial",
    question: "Is there a free trial?",
    answer:
      "Yes. New first-time subscribers currently get a 90-day (3-month) free trial at checkout. A card is collected to start the trial, but you are not charged during it. If you cancel before the trial end date shown in billing, you will not be charged. Returning customers who previously held a subscription are not normally offered another free trial.",
  },
  {
    id: "bank-feed",
    question: "Do I need to connect my bank?",
    answer:
      "No. SelfSubmit does not require a bank feed or Open Banking connection. You enter income and expenses on your monthly form, and you can attach receipts or CSV files. That is enough for digital MTD records.",
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
      "Yes. Cancel from the billing portal in your dashboard. If you cancel during a free trial, access continues until the trial end date and you will not be charged. If you cancel during a paid period, access continues until the end of that billing period and you will not be charged again. After paid access ends there is a 30-day grace period to export records, delete your account, or resubscribe. Cancelling stops future charges; it does not automatically refund the current month.",
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
