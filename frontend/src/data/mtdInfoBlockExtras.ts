/** Extra copy for homepage cards and detail pages — keyed by info block slug. */
export type MtdInfoBlockExtras = {
  cardIntro: string;
  highlights: [string, string, string];
  additionalDetail: string;
  commonMistakes: string[];
  selfSubmitTip: string;
};

export const MTD_INFO_BLOCK_EXTRAS: Record<string, MtdInfoBlockExtras> = {
  "mtd-for-income-tax": {
    cardIntro:
      "MTD for Income Tax (MTD ITSA) is HMRC’s digital reporting system for self-employed people and landlords. You keep records digitally, send quarterly summaries during the year, then file a final declaration.",
    highlights: [
      "Digital records replace paper-only bookkeeping for those in scope",
      "Quarterly updates are summaries — not your full tax bill",
      "Thresholds are £50k (Apr 2026), then £30k (2027) and £20k (2028)",
    ],
    additionalDetail:
      "Self-employed profits and UK property income count toward the threshold. If you are employed as well, employment income is usually handled through PAYE but still appears on your end-of-year declaration. Software must be able to send data to HMRC securely — spreadsheets alone are rarely enough unless they meet digital-link rules.",
    commonMistakes: [
      "Assuming quarterly updates are the same as paying tax — payment dates are separate",
      "Waiting until January to organise a full year of receipts",
      "Using software that cannot connect to HMRC when you are in scope",
    ],
    selfSubmitTip:
      "SelfSubmit supports monthly income and expense capture so quarterly figures are available when due. Select your trade when you add a business and the form loads the relevant line items.",
  },
  "mtd-for-vat": {
    cardIntro:
      "If you are VAT-registered, MTD for VAT applies regardless of your income tax MTD status. You must keep digital VAT records and submit returns through compatible software.",
    highlights: [
      "Separate from MTD for Income Tax — many businesses need both",
      "All VAT-registered businesses are in scope unless exempt",
      "Records must support every figure on each VAT Return",
    ],
    additionalDetail:
      "VAT periods are usually quarterly. Your software records sales and purchases, calculates VAT due, and submits the return to HMRC. Flat Rate Scheme users still need digital records. If you deregister from VAT, MTD for VAT obligations end — but income tax MTD may still apply.",
    commonMistakes: [
      "Treating VAT turnover and income tax turnover as the same figure",
      "Re-typing totals from paper into software without digital links (VAT)",
      "Missing VAT deadlines because only income tax reminders were set",
    ],
    selfSubmitTip:
      "SelfSubmit focuses on income tax monthly records today. If you are VAT-registered, use MTD VAT software alongside SelfSubmit for your self-employment records.",
  },
  "mtd-deadlines": {
    cardIntro:
      "MTD adds quarterly reporting dates throughout the tax year on top of familiar Self Assessment payment deadlines. Missing a date can trigger penalties.",
    highlights: [
      "Quarterly update deadlines follow your accounting period",
      "31 January remains key for balancing payments and declarations",
      "31 July payment on account applies to many taxpayers",
    ],
    additionalDetail:
      "Your software or HMRC account shows the exact due date for each quarterly period. Calendar reminders should cover both submissions and payments. Agents can file on your behalf but you remain responsible for timeliness.",
    commonMistakes: [
      "Only diarising January and forgetting quarterly updates",
      "Believing an extension for one obligation covers all HMRC deadlines",
      "Submitting late because records were not kept during the quarter",
    ],
    selfSubmitTip:
      "Use the SelfSubmit dashboard deadline view and optional email reminders so monthly record-keeping stays on track before each HMRC quarter ends.",
  },
  "business-types": {
    cardIntro:
      "Sole traders, partners, and landlords can all be within MTD depending on income levels and how you earn money. Structure affects how you file, not whether digital records matter.",
    highlights: [
      "Sole traders report their own trading profits",
      "Partnerships may require nominated partner filings",
      "UK property income has its own MTD rules when in scope",
    ],
    additionalDetail:
      "Multiple trades or rental properties may mean separate records in your software. Employed income alone does not usually trigger MTD ITSA, but total qualifying income from self-employment and property determines if you must join.",
    commonMistakes: [
      "Omitting secondary self-employment income when assessing the £50k threshold",
      "Assuming a limited company’s rules apply to sole trader MTD",
      "Not agreeing record-keeping duties in a partnership",
    ],
    selfSubmitTip:
      "See every profession with a tailored form on our business types page, or add each business separately in SelfSubmit with the right income and expense lines.",
  },
  "record-keeping": {
    cardIntro:
      "Good records are the foundation of MTD. HMRC expects digital, complete, and accurate records that support every figure you submit — backed by invoices and receipts.",
    highlights: [
      "Record income and expenses close to when they happen",
      "Keep evidence for at least five years after the 31 January deadline",
      "Separate personal and business spending clearly",
    ],
    additionalDetail:
      "Bank statements, invoices, receipts, mileage logs, and contract notes all support your return. Simplified expenses (e.g. flat-rate mileage) still need underlying journey records. HMRC can ask to see records during compliance checks.",
    commonMistakes: [
      "Leaving receipts unorganised and entering figures only at year end",
      "Claiming expenses without proof of business use",
      "Mixing personal and business transactions on one card with no notes",
    ],
    selfSubmitTip:
      "Upload receipt photos in SelfSubmit as you go and complete your monthly return so quarterly HMRC figures are already organised.",
  },
  "self-employed-mtd": {
    cardIntro:
      "If you work for yourself, trading profits count toward MTD thresholds. When in scope you report business income and allowable costs digitally through the year.",
    highlights: [
      "Register for Self Assessment if you are not already",
      "All trading income counts — including side gigs and platforms",
      "National Insurance on profits is still calculated via Self Assessment",
    ],
    additionalDetail:
      "CIS subcontractors receive deductions at source but still report income and may claim expenses. Casual or part-time self-employment can push you over the threshold when combined with other qualifying income.",
    commonMistakes: [
      "Not registering by 5 October after the tax year you started trading",
      "Forgetting platform fees (Uber, Etsy, etc.) when calculating profit",
      "Treating all money in the bank as income without deducting allowable costs",
    ],
    selfSubmitTip:
      "SelfSubmit gives each business type its own simple income and expense form — from taxi drivers and trades to cleaners, freelancers, and landlords.",
  },
  "landlord-mtd": {
    cardIntro:
      "UK property landlords may need MTD for Income Tax when rental profits push total qualifying income above HMRC thresholds. Records must cover rent and allowable property costs.",
    highlights: [
      "Residential and commercial UK rentals can count",
      "Joint ownership — understand how your share of rent is reported",
      "Mortgage interest rules differ from a straight expense deduction",
    ],
    additionalDetail:
      "Furnished holiday lettings, rent-a-room relief, and overseas property have different tax treatments. Allowable costs include letting agent fees, maintenance, and insurance — but capital improvements are not usually revenue expenses.",
    commonMistakes: [
      "Deducting full mortgage interest instead of following tax credit rules",
      "Not recording all rent including short-term lets",
      "Missing allowable repairs because receipts were personal",
    ],
    selfSubmitTip:
      "Landlords can select property income professions in SelfSubmit and track rent and expenses monthly ready for quarterly reporting.",
  },
  "hmrc-approved-software": {
    cardIntro:
      "HMRC requires functional compatible software that keeps digital records and submits MTD updates securely. You choose from published compatible products listed on GOV.UK.",
    highlights: [
      "Software must connect to HMRC APIs for submissions",
      "Free and paid options exist for different complexity levels",
      "Bridging tools exist for limited spreadsheet workflows",
    ],
    additionalDetail:
      "Check HMRC’s current software lists for MTD for Income Tax and VAT separately. Authorise each product through Government Gateway. One product may cover multiple businesses if it supports your setup.",
    commonMistakes: [
      "Buying software that only does invoicing without MTD submission",
      "Not completing HMRC authorisation so submissions silently fail",
      "Using incompatible spreadsheets and typing figures manually each quarter",
    ],
    selfSubmitTip:
      "SelfSubmit helps you maintain monthly digital records aligned with MTD principles. Connect your HMRC account to preview and submit quarterly updates from your dashboard.",
  },
  "mtd-exemptions": {
    cardIntro:
      "Exemptions from MTD are narrow. Most people above income thresholds must comply. Below threshold you are not required to join MTD ITSA yet.",
    highlights: [
      "Exemptions are not automatic — HMRC must agree",
      "Digital inability for age, disability, or religion may qualify",
      "Below-threshold taxpayers are outside MTD ITSA scope for now",
    ],
    additionalDetail:
      "Being uncomfortable with technology is usually not enough on its own. VAT MTD exemptions are assessed separately. If exempt, you may still need to keep records and file through other channels HMRC specifies.",
    commonMistakes: [
      "Assuming exemption without applying or checking income",
      "Confusing VAT and income tax exemption rules",
      "Assuming exemption based on informal advice rather than HMRC confirmation",
    ],
    selfSubmitTip:
      "If your status is unclear, maintain digital records in SelfSubmit while you confirm requirements on GOV.UK or with a qualified adviser.",
  },
  "penalties-and-fines": {
    cardIntro:
      "HMRC penalties apply for late quarterly updates, late final declarations, and late payment. Interest accrues on unpaid tax. Timely submissions and payments reduce penalty and interest risk.",
    highlights: [
      "Late submission penalties increase over time",
      "Late payment interest is charged separately",
      "Reasonable excuse may reduce penalties if accepted",
    ],
    additionalDetail:
      "Nil updates may still be required in some periods — check HMRC guidance. Payment on account spreads next year’s bill. Budget for tax and National Insurance as profits grow, not only in January.",
    commonMistakes: [
      "Leaving HMRC correspondence unaddressed",
      "Missing a quarter with zero income without filing where required",
      "Not setting aside cash monthly for January and July payments",
    ],
    selfSubmitTip:
      "Regular monthly entries in SelfSubmit reduce last-minute corrections before quarterly deadlines and help identify figures that need review.",
  },
  "quarterly-updates": {
    cardIntro:
      "Four times a year you send HMRC a summary of business income and expenses. These updates inform HMRC during the year — they are not your final tax calculation.",
    highlights: [
      "Updates follow your chosen accounting period quarters",
      "Figures should reconcile to bank and records",
      "Errors can often be corrected in a later update",
    ],
    additionalDetail:
      "Software may show cumulative or period figures depending on HMRC rules for MTD ITSA. Review each update before submitting. Keep notes if figures change significantly from earlier quarters.",
    commonMistakes: [
      "Submitting guessed figures without reconciling the bank",
      "Thinking quarterly submission replaces the final declaration",
      "Forgetting property or second trade income in one update",
    ],
    selfSubmitTip:
      "SelfSubmit monthly records roll up into clear totals ready for your quarterly HMRC update when live filing is enabled.",
  },
  "final-declaration": {
    cardIntro:
      "After the tax year ends you confirm your complete income position — employment, pensions, savings, dividends, and business profits — and settle any remaining tax.",
    highlights: [
      "Replaces the main Self Assessment return for MTD ITSA users",
      "Must include all income sources, not only self-employment",
      "Reliefs such as Marriage Allowance may be claimed here",
    ],
    additionalDetail:
      "Your final declaration should align with quarterly updates unless you document why figures changed. HMRC produces a tax calculation you should review before paying any balance due.",
    commonMistakes: [
      "Omitting employment or investment income",
      "Not claiming available reliefs or allowances",
      "Assuming quarterly data means no year-end review is needed",
    ],
    selfSubmitTip:
      "Export PDF copies of each monthly SelfSubmit return before year-end so you have a clean record when completing your final declaration.",
  },
  "income-sources": {
    cardIntro:
      "Most people have more than one type of income. MTD tracks qualifying business and property income digitally; everything else still goes on your final declaration.",
    highlights: [
      "Employment is usually taxed via PAYE but reported at year-end",
      "Multiple trades may need separate records",
      "Savings and dividends have their own allowances",
    ],
    additionalDetail:
      "Total qualifying income determines MTD scope. Child Benefit High Income Charge, student loan repayments, and pension contributions can all affect tax due — not only trading profit.",
    commonMistakes: [
      "Reporting only the main job and forgetting a small side business",
      "Double-counting income already taxed at source",
      "Not separating UK property from self-employment records",
    ],
    selfSubmitTip:
      "Run separate businesses in SelfSubmit when you have distinct trades — each with the right profession template for its income and expenses.",
  },
  "allowable-expenses": {
    cardIntro:
      "Allowable expenses reduce taxable profit but must be incurred wholly and exclusively for business. Personal costs, fines, and most entertainment are not allowable.",
    highlights: [
      "Keep receipts for every business purchase you claim",
      "Simplified expenses available for mileage, home, and flat-rate costs",
      "Capital items may use capital allowances instead",
    ],
    additionalDetail:
      "Working-from-home claims can use simplified rates or actual costs. Clothing is only allowable if specialist or branded uniform required for work. Client entertaining is generally not deductible against trading profit.",
    commonMistakes: [
      "Claiming full mobile or internet bills without business-use percentage",
      "Treating vehicle purchase as a revenue expense in year one",
      "Claiming personal groceries or meals without business travel rules",
    ],
    selfSubmitTip:
      "SelfSubmit profession templates list common allowable lines for your trade — for example meter takings, tools, and mileage — covering frequent expense categories for that work.",
  },
  "digital-records": {
    cardIntro:
      "MTD means more than scanning paper — the underlying transaction data must live digitally and support submissions without manual re-keying between systems.",
    highlights: [
      "Cloud software is the norm for compliant record-keeping",
      "Back up records and restrict access for security",
      "Bank feeds help reconcile income and spending",
    ],
    additionalDetail:
      "VAT digital link rules are stricter than some income tax setups, but good habits benefit everyone. HMRC may request records during enquiries — disorganised files slow resolution and risk adjustments.",
    commonMistakes: [
      "Taking photos of receipts but never entering amounts digitally",
      "Relying on one laptop with no backup",
      "Deleting source documents after submitting a quarter",
    ],
    selfSubmitTip:
      "SelfSubmit stores receipt uploads securely and ties them to your monthly figures — a practical digital record for self-employed monthly reporting.",
  },
  "mtd-sign-up": {
    cardIntro:
      "Joining MTD means registering for Self Assessment (if needed), choosing software, and authorising it with Government Gateway credentials.",
    highlights: [
      "Register for Self Assessment by 5 October after starting",
      "HMRC may notify you when you must join MTD ITSA",
      "Authorise each software product you use",
    ],
    additionalDetail:
      "Keep Government Gateway details safe and enable two-step verification. Update your address and email in HMRC online services so you receive sign-up prompts and penalty warnings.",
    commonMistakes: [
      "Starting to trade without any HMRC registration",
      "Using software without completing the HMRC connection step",
      "Sharing Gateway credentials with untrusted third parties",
    ],
    selfSubmitTip:
      "Create your SelfSubmit account, complete profile and business setup, and start monthly records — you will be ready when live HMRC connection goes live for your situation.",
  },
  "hmrc-online-services": {
    cardIntro:
      "Government Gateway unlocks your personal tax account, payment history, MTD authorisations, and messages from HMRC — essential for digital tax management.",
    highlights: [
      "One account for authorising software and viewing liabilities",
      "Two-step verification strongly recommended",
      "Agents need separate authorisation to act for you",
    ],
    additionalDetail:
      "You can view payments on account, check coding notices, and update contact details online. Lost credentials can be recovered through HMRC’s process — allow time before deadlines.",
    commonMistakes: [
      "Letting an agent authorise without understanding what they can see",
      "Using weak passwords without 2FA on tax accounts",
      "Missing HMRC secure messages in email spam",
    ],
    selfSubmitTip:
      "SelfSubmit complements HMRC online services — we organise your records; your Government Gateway account remains where you authorise submissions and view HMRC’s tax calculation.",
  },
  "tax-calculations": {
    cardIntro:
      "Tax due depends on total income, allowances, and reliefs — not only quarterly trading summaries. Plan cash flow around estimates and final calculations.",
    highlights: [
      "Income tax bands and personal allowance apply to total income",
      "Payment on account based on prior year profit",
      "Student loans and benefits charges may increase the bill",
    ],
    additionalDetail:
      "Class 2 and Class 4 National Insurance apply to self-employed profits above thresholds. Dividend and savings allowances reduce tax on those sources separately. HMRC’s estimate tools help planning but are not professional advice.",
    commonMistakes: [
      "Spending all profit without reserving tax money",
      "Ignoring payment on account in July",
      "Assuming CIS deductions mean no further tax is due",
    ],
    selfSubmitTip:
      "SelfSubmit shows monthly net profit so you can set aside a sensible percentage for tax and NI throughout the year.",
  },
  "agent-services": {
    cardIntro:
      "Qualified accountants and bookkeepers can file MTD updates on your behalf once you authorise them through HMRC Agent Services.",
    highlights: [
      "You remain legally responsible for accurate returns",
      "Check agent is registered and ideally professionally regulated",
      "Review figures before each deadline",
    ],
    additionalDetail:
      "Authorisation is per client relationship. Agents use an Agent Services Account. Clear communication on record deadlines supports timely filing — submission quality depends on the accuracy of the records supplied.",
    commonMistakes: [
      "Providing incomplete records immediately before a filing deadline",
      "Assuming the agent is liable if figures are wrong",
      "Not authorising the correct business in HMRC",
    ],
    selfSubmitTip:
      "Export SelfSubmit PDF monthly returns or your leave-account ZIP to give your accountant clean, structured figures instead of raw bank CSVs alone.",
  },
  "help-and-support": {
    cardIntro:
      "HMRC publishes authoritative guidance on GOV.UK, runs free webinars, and offers helplines. Complex situations benefit from regulated professional advice.",
    highlights: [
      "GOV.UK collections are updated when rules change",
      "Webinars cover MTD for Income Tax step by step",
      "Contact HMRC early if you cannot meet a deadline",
    ],
    additionalDetail:
      "SelfSubmit is record-keeping and submission software — not tax advice. For disputes, investigations, or complex structures, use an ICAEW, ACCA, or AAT member firm. Community forums are not a substitute for GOV.UK.",
    commonMistakes: [
      "Relying on social media tax “hacks” instead of GOV.UK",
      "Missing HMRC letters and penalty notices",
      "Waiting until investigation to find missing records",
    ],
    selfSubmitTip:
      "Use SelfSubmit for organised monthly records and our information blocks for concise MTD summaries — always verify rule changes on GOV.UK before acting.",
  },
};

export function getInfoBlockExtras(slug: string): MtdInfoBlockExtras | undefined {
  return MTD_INFO_BLOCK_EXTRAS[slug];
}
