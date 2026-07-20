import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Building2,
  Calculator,
  Calendar,
  FileCheck,
  FileText,
  HelpCircle,
  Landmark,
  Laptop,
  LineChart,
  Receipt,
  ShieldCheck,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

export type MtdCategoryContent = {
  id: number;
  slug: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  whatItIs: string;
  whoItAppliesTo: string;
  whatYouNeedToDo: string[];
  keyPoints: string[];
  hmrcLinks: { label: string; url: string }[];
};

/**
 * Content aligned with HMRC guidance on GOV.UK (Making Tax Digital, Self Assessment, VAT).
 * Always check GOV.UK for the latest rules — thresholds and dates can change.
 */
export const MTD_CATEGORY_CONTENT: MtdCategoryContent[] = [
  {
    id: 1,
    slug: "mtd-for-income-tax",
    title: "MTD for Income Tax",
    icon: FileText,
    summary:
      "Making Tax Digital for Income Tax (MTD ITSA) means keeping digital records and sending quarterly updates to HMRC, then a final declaration.",
    whatItIs:
      "MTD for Income Tax (also called MTD ITSA) is HMRC’s digital way for self-employed people and landlords to report income tax. Instead of only filing once a year on paper, you keep digital business records and send updates through compatible software during the tax year, followed by a final declaration.",
    whoItAppliesTo:
      "From April 2026, it applies to self-employed individuals and landlords whose total qualifying income is over £50,000 (reducing to £30,000 from April 2027, and £20,000 from April 2028, under current government plans). You must also be registered for Self Assessment. Check GOV.UK for your exact start date.",
    whatYouNeedToDo: [
      "Keep digital records of income and expenses as you go.",
      "Send quarterly updates to HMRC (income and expenses summary).",
      "Send a final declaration after the tax year ends, including any other income.",
      "Use HMRC-compatible software that connects to HMRC systems.",
    ],
    keyPoints: [
      "Quarterly updates are not a tax bill — they update HMRC on your trading income.",
      "You still pay tax through Self Assessment payment deadlines.",
      "Separate rules apply if you also operate a VAT-registered business.",
    ],
    hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
    ],
  },
  {
    id: 2,
    slug: "mtd-for-vat",
    title: "MTD for VAT",
    icon: Receipt,
    summary:
      "VAT-registered businesses must keep digital VAT records and submit VAT Returns using compatible software.",
    whatItIs:
      "Making Tax Digital for VAT requires VAT-registered businesses to keep digital records and submit VAT Returns using functional compatible software. It is separate from MTD for Income Tax but many businesses must follow both.",
    whoItAppliesTo:
      "All VAT-registered businesses must follow MTD for VAT rules, unless HMRC has granted a specific exemption. This includes companies, partnerships, and sole traders above the VAT registration threshold.",
    whatYouNeedToDo: [
      "Keep digital VAT records (sales and purchases).",
      "Submit VAT Returns through MTD-compatible software.",
      "Ensure records support the figures on each return.",
    ],
    keyPoints: [
      "MTD for VAT applies even if your income tax is below MTD ITSA thresholds.",
      "Some businesses use the VAT Flat Rate Scheme — records must still be digital.",
    ],
    hmrcLinks: [
      { label: "Sign up for MTD for VAT", url: "https://www.gov.uk/vat-record-keeping/sign-up-for-making-tax-digital-for-vat" },
      { label: "How to keep digital records", url: "https://www.gov.uk/guidance/keeping-digital-records-for-vat" },
    ],
  },
  {
    id: 3,
    slug: "mtd-deadlines",
    title: "MTD Deadlines",
    icon: Calendar,
    summary:
      "MTD adds quarterly update deadlines during the tax year, plus Self Assessment payment and final declaration dates.",
    whatItIs:
      "Under MTD for Income Tax you must meet quarterly update deadlines tied to your accounting period, as well as existing Self Assessment deadlines for paying tax and submitting your final declaration.",
    whoItAppliesTo:
      "Anyone required to follow MTD for Income Tax must meet the quarterly timetable HMRC sets for their business. VAT-registered businesses have separate VAT Return deadlines.",
    whatYouNeedToDo: [
      "Note your quarterly period end dates in your software or calendar.",
      "Submit each quarterly update by the deadline HMRC gives you.",
      "Complete your final declaration and pay any tax due by 31 January after the tax year.",
    ],
    keyPoints: [
      "Missing a quarterly update can result in penalties.",
      "Payment on account dates (31 January and 31 July) still apply for many taxpayers.",
    ],
    hmrcLinks: [
      { label: "Self Assessment tax return deadlines", url: "https://www.gov.uk/self-assessment-tax-returns/deadlines" },
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
    ],
  },
  {
    id: 4,
    slug: "business-types",
    title: "Business Types",
    icon: Building2,
    summary:
      "Sole traders, partnerships, and landlords can all be in scope for MTD — rules depend on income and how you trade.",
    whatItIs:
      "HMRC’s MTD rules focus on how much qualifying income you receive and whether you are self-employed or receive UK property income. Your legal structure (sole trader vs partnership) affects how returns are filed but digital record-keeping is required for those in scope.",
    whoItAppliesTo:
      "Self-employed sole traders, members of partnerships with trading income, and landlords receiving UK property income may need to follow MTD when above income thresholds.",
    whatYouNeedToDo: [
      "Confirm whether your total qualifying income exceeds HMRC thresholds.",
      "If in a partnership, agree who maintains digital records.",
      "Use software that supports your business type and number of income streams.",
    ],
    keyPoints: [
      "Employed income alone does not usually trigger MTD ITSA — but may still appear on your final declaration.",
      "Multiple trades or properties may mean multiple records in one account.",
    ],
    hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
    ],
  },
  {
    id: 5,
    slug: "record-keeping",
    title: "Record Keeping",
    icon: FileCheck,
    summary:
      "You must keep digital records of income and expenses that support your quarterly updates and tax return.",
    whatItIs:
      "HMRC requires digital records that are complete, accurate, and readable. For MTD for Income Tax this means recording income and expenses in digital form — not only on paper — and retaining evidence such as receipts and invoices.",
    whoItAppliesTo:
      "Everyone within MTD for Income Tax or MTD for VAT must keep records that meet HMRC’s digital record-keeping rules for that regime.",
    whatYouNeedToDo: [
      "Record sales and purchases close to when they happen.",
      "Store invoices, receipts, and bank statements.",
      "Keep records for at least 5 years after the 31 January submission deadline (Self Assessment rules).",
    ],
    keyPoints: [
      "You can use spreadsheets only if they meet digital link rules — most people use approved software.",
      "Simplified expenses (e.g. mileage) still need supporting records.",
    ],
    hmrcLinks: [
      { label: "Keeping your pay and tax records", url: "https://www.gov.uk/self-employed-records" },
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
    ],
  },
  {
    id: 6,
    slug: "self-employed-mtd",
    title: "Self-Employed MTD",
    icon: UserCheck,
    summary:
      "Self-employed traders above the income threshold must join MTD for Income Tax and report trading income digitally.",
    whatItIs:
      "If you work for yourself (not through PAYE), your trading profits count toward MTD thresholds. When in scope, you report business income and allowable expenses through quarterly updates and a final declaration.",
    whoItAppliesTo:
      "Self-employed individuals with qualifying income above HMRC’s threshold who are registered for Self Assessment.",
    whatYouNeedToDo: [
      "Register for Self Assessment if you are not already.",
      "Sign up for MTD for Income Tax when HMRC tells you to or when you exceed the threshold.",
      "Track all business income and allowable expenses digitally.",
    ],
    keyPoints: [
      "Side gigs and casual self-employment may count toward your total qualifying income.",
      "National Insurance may still be due on profits through Self Assessment.",
    ],
    hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
      { label: "Register for Self Assessment", url: "https://www.gov.uk/register-for-self-assessment" },
    ],
  },
  {
    id: 7,
    slug: "landlord-mtd",
    title: "Landlord MTD",
    icon: Landmark,
    summary:
      "UK property landlords may need MTD for Income Tax when rental income is above the threshold.",
    whatItIs:
      "Landlords receiving UK property income may need to follow MTD for Income Tax. This includes renting out residential or commercial property. Digital records must cover rent received and allowable property expenses.",
    whoItAppliesTo:
      "Individuals with UK property income above the MTD threshold, including some joint owners — check how your share of income is counted.",
    whatYouNeedToDo: [
      "Record rent and property expenses digitally.",
      "Submit quarterly updates for property income.",
      "Include property profits on your final declaration.",
    ],
    keyPoints: [
      "Furnished holiday lettings and other property types can have different tax rules.",
      "Mortgage interest restrictions still apply — not always a straight deduction.",
    ],
    hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
      { label: "Renting out a property", url: "https://www.gov.uk/renting-out-a-property" },
    ],
  },
  {
    id: 8,
    slug: "hmrc-approved-software",
    title: "HMRC Approved Software",
    icon: Laptop,
    summary:
      "You must use functional compatible software that can send MTD updates to HMRC securely.",
    whatItIs:
      "HMRC does not approve individual products by name in all cases — they publish lists of software that supports Making Tax Digital. Software must be able to keep digital records and submit updates to HMRC via their APIs.",
    whoItAppliesTo:
      "Anyone required to follow MTD for Income Tax or MTD for VAT must use software that HMRC recognises as compatible for that obligation.",
    whatYouNeedToDo: [
      "Choose software from HMRC’s compatible software lists.",
      "Connect your HMRC account through the software’s authorisation process.",
      "Check the software covers all your income streams and VAT if applicable.",
    ],
    keyPoints: [
      "Free options exist for simple cases; paid software may suit multiple businesses.",
      "Bridging software can submit figures from spreadsheets in limited cases.",
    ],
    hmrcLinks: [
      { label: "Find MTD for Income Tax software", url: "https://www.gov.uk/guidance/choose-the-right-software-for-making-tax-digital-for-income-tax" },
      { label: "Find MTD for VAT software", url: "https://www.gov.uk/guidance/software-compatible-with-making-tax-digital-for-vat" },
    ],
  },
  {
    id: 9,
    slug: "mtd-exemptions",
    title: "MTD Exemptions",
    icon: ShieldCheck,
    summary:
      "Some people cannot use digital tools and may qualify for an exemption from MTD — most businesses must comply.",
    whatItIs:
      "HMRC allows exemptions in limited circumstances, for example if you cannot use digital tools due to disability, age, remoteness of location, or religious grounds. Exemptions are not automatic — you must apply or qualify under HMRC rules.",
    whoItAppliesTo:
      "Businesses below income thresholds are not required to join MTD ITSA yet. Those above thresholds who genuinely cannot use digital tools may seek an exemption.",
    whatYouNeedToDo: [
      "Check whether your income is below the threshold.",
      "If you believe you qualify for exemption, follow HMRC’s application process.",
      "Otherwise, use compatible software and keep digital records.",
    ],
    keyPoints: [
      "Being unfamiliar with technology is not usually enough for an exemption alone.",
      "VAT MTD has separate exemption rules from income tax MTD.",
    ],
    hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
    ],
  },
  {
    id: 10,
    slug: "penalties-and-fines",
    title: "Penalties & Fines",
    icon: AlertTriangle,
    summary:
      "Late quarterly updates, late final declarations, and late payment can all lead to HMRC penalties.",
    whatItIs:
      "HMRC charges penalties for late submission and late payment under Self Assessment and MTD timetables. Penalties can increase the longer a return or update is overdue.",
    whoItAppliesTo:
      "Anyone with MTD or Self Assessment obligations who misses deadlines without a reasonable excuse.",
    whatYouNeedToDo: [
      "Set reminders for quarterly and annual deadlines.",
      "Submit updates even if you have no income in a period (nil updates where allowed).",
      "Pay tax due by 31 January and 31 July where payment on account applies.",
    ],
    keyPoints: [
      "HMRC may reduce penalties if you have a reasonable excuse.",
      "Late payment interest accrues separately from penalties.",
    ],
    hmrcLinks: [
      { label: "Self Assessment penalties", url: "https://www.gov.uk/understanding-self-assessment-penalties" },
      { label: "Pay your Self Assessment bill", url: "https://www.gov.uk/pay-self-assessment-tax-bill" },
    ],
  },
  {
    id: 11,
    slug: "quarterly-updates",
    title: "Quarterly Updates",
    icon: LineChart,
    summary:
      "Four updates per year summarise your income and expenses — they are not your final tax calculation.",
    whatItIs:
      "Quarterly updates send HMRC a summary of your business income and expenses for each quarter of your accounting period. They help HMRC keep your tax position up to date during the year.",
    whoItAppliesTo:
      "All businesses and landlords within MTD for Income Tax must submit them on schedule unless HMRC confirms otherwise.",
    whatYouNeedToDo: [
      "Complete each update in your software before the deadline.",
      "Review figures against bank statements and records.",
      "Correct errors in a later update if you find mistakes.",
    ],
    keyPoints: [
      "Updates use cumulative or period figures depending on HMRC guidance for your software.",
      "You still file a final declaration after the tax year ends.",
    ],
    hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
    ],
  },
  {
    id: 12,
    slug: "final-declaration",
    title: "Final Declaration",
    icon: FileCheck,
    summary:
      "After the tax year ends you confirm your full income and pay any remaining tax — this replaces the main SA return for MTD users.",
    whatItIs:
      "The final declaration is your end-of-year confirmation to HMRC. You include all income sources (employment, pensions, savings, dividends, and business income) and claim reliefs. It finalises your tax position for the year.",
    whoItAppliesTo:
      "Everyone within MTD for Income Tax must submit a final declaration in addition to quarterly updates.",
    whatYouNeedToDo: [
      "Gather all income records for the tax year.",
      "Complete the final declaration in your MTD software.",
      "Pay any balance due by the Self Assessment deadline.",
    ],
    keyPoints: [
      "Your final declaration must match your quarterly updates unless you explain changes.",
      "Marriage Allowance and other reliefs are claimed here where applicable.",
    ],
    hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
    ],
  },
  {
    id: 13,
    slug: "income-sources",
    title: "Income Sources",
    icon: Wallet,
    summary:
      "You may have several income streams — each may need to be recorded separately under MTD.",
    whatItIs:
      "Qualifying income can include self-employment, UK property, and other categories HMRC counts toward MTD thresholds. Your final declaration must report all taxable income, not only business profits.",
    whoItAppliesTo:
      "Anyone with multiple trades, employments, pensions, or investments — MTD software may track multiple ‘businesses’ or property rentals.",
    whatYouNeedToDo: [
      "List all income streams at the start of the tax year.",
      "Keep separate records where HMRC or your software requires it.",
      "Report non-MTD income on your final declaration.",
    ],
    keyPoints: [
      "Employment income is usually reported via PAYE but still included in final figures.",
      "Dividends and savings have their own allowances and rates.",
    ],
    hmrcLinks: [
      { label: "Income Tax rates and allowances", url: "https://www.gov.uk/income-tax-rates" },
    ],
  },
  {
    id: 14,
    slug: "allowable-expenses",
    title: "Allowable Expenses",
    icon: Receipt,
    summary:
      "You can deduct allowable business expenses from income — they must be wholly and exclusively for trade.",
    whatItIs:
      "Allowable expenses reduce your taxable profit. HMRC rules require expenses to be incurred wholly and exclusively for the purposes of your trade or property business. Personal costs are not allowable.",
    whoItAppliesTo:
      "Self-employed businesses and landlords claiming expenses against rental or trading income.",
    whatYouNeedToDo: [
      "Keep receipts and invoices for all business purchases.",
      "Separate personal and business spending.",
      "Use simplified expenses only where HMRC allows (e.g. mileage flat rate).",
    ],
    keyPoints: [
      "Capital items may follow different rules (capital allowances).",
      "Working from home has specific simplified or actual cost methods.",
    ],
    hmrcLinks: [
      { label: "Expenses if you are self-employed", url: "https://www.gov.uk/expenses-if-youre-self-employed" },
      { label: "Allowable expenses for landlords", url: "https://www.gov.uk/guidance/expenses-for-landlords" },
    ],
  },
  {
    id: 15,
    slug: "digital-records",
    title: "Digital Records",
    icon: Laptop,
    summary:
      "Records must be digital, complete, and preserved — paper alone is not enough for MTD.",
    whatItIs:
      "Digital records mean storing transaction data electronically in a way that supports your MTD submissions. You can scan paper receipts but the underlying data must be held digitally.",
    whoItAppliesTo:
      "All taxpayers within MTD for Income Tax and MTD for VAT.",
    whatYouNeedToDo: [
      "Use cloud accounting or MTD software from day one.",
      "Back up records regularly.",
      "Reconcile bank feeds where possible.",
    ],
    keyPoints: [
      "HMRC may ask to see records during compliance checks.",
      "Digital link rules prevent manual re-typing between systems for VAT.",
    ],
    hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
    ],
  },
  {
    id: 16,
    slug: "mtd-sign-up",
    title: "MTD Sign Up",
    icon: Users,
    summary:
      "Sign up for Self Assessment first, then register for MTD for Income Tax when required.",
    whatItIs:
      "Signing up involves registering for Self Assessment (if needed), choosing compatible software, and authorising it to interact with HMRC. HMRC may invite you when you approach the income threshold.",
    whoItAppliesTo:
      "Newly self-employed people, landlords crossing the threshold, and businesses starting to trade.",
    whatYouNeedToDo: [
      "Register for Self Assessment by 5 October after the tax year you started.",
      "Follow HMRC letters or messages about MTD sign-up dates.",
      "Authorise your software using your Government Gateway credentials.",
    ],
    keyPoints: [
      "You need a Government Gateway user ID and password.",
      "Keep your contact details updated in your HMRC account.",
    ],
    hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
      { label: "Register for Self Assessment", url: "https://www.gov.uk/register-for-self-assessment" },
    ],
  },
  {
    id: 17,
    slug: "hmrc-online-services",
    title: "HMRC Online Services",
    icon: Landmark,
    summary:
      "Your Government Gateway account lets you view tax, authorise software, and manage HMRC online.",
    whatItIs:
      "HMRC Online Services (via Government Gateway) is where you access your personal tax account, authorise MTD software, view payments, and check messages from HMRC.",
    whoItAppliesTo:
      "Everyone filing Self Assessment or using MTD needs online access unless they use an agent or have an exemption.",
    whatYouNeedToDo: [
      "Create or recover your Government Gateway user ID.",
      "Add two-step verification for security.",
      "Authorise each software product you use for MTD.",
    ],
    keyPoints: [
      "Agents can act for you if you grant appropriate authorisation.",
      "Never share your credentials with untrusted third parties.",
    ],
    hmrcLinks: [
      { label: "HMRC online services", url: "https://www.gov.uk/log-in-register-hmrc-online-services" },
      { label: "Your tax account", url: "https://www.gov.uk/personal-tax-account" },
    ],
  },
  {
    id: 18,
    slug: "tax-calculations",
    title: "Tax Calculations",
    icon: Calculator,
    summary:
      "HMRC calculates tax due based on your updates and final declaration — understand estimates vs final bills.",
    whatItIs:
      "Tax is calculated on your total income minus allowances and reliefs. MTD quarterly updates do not always show your final tax bill; the final declaration determines tax due after all income is included.",
    whoItAppliesTo:
      "All Self Assessment taxpayers, including those on MTD.",
    whatYouNeedToDo: [
      "Review HMRC’s tax calculation after submitting your final declaration.",
      "Set aside money for tax and National Insurance throughout the year.",
      "Use HMRC’s estimate tools for planning (not a substitute for professional advice).",
    ],
    keyPoints: [
      "Payment on account spreads next year’s bill based on previous years.",
      "Student loans and Child Benefit charges may affect total due.",
    ],
    hmrcLinks: [
      { label: "Estimate Self Assessment bill", url: "https://www.gov.uk/estimate-self-assessment-tax-bill" },
      { label: "How Income Tax is calculated", url: "https://www.gov.uk/income-tax/how-you-pay-income-tax" },
    ],
  },
  {
    id: 19,
    slug: "agent-services",
    title: "Agent Services",
    icon: UserCheck,
    summary:
      "Accountants and tax agents can submit MTD updates on your behalf if you authorise them in HMRC online services.",
    whatItIs:
      "HMRC’s Agent Services Account lets qualified agents act for multiple clients. You must authorise your agent to view and submit data for your business.",
    whoItAppliesTo:
      "Anyone using an accountant, bookkeeper, or tax adviser registered with HMRC as an agent.",
    whatYouNeedToDo: [
      "Choose an agent registered for MTD services.",
      "Authorise them through your HMRC business tax account or using an authorisation code.",
      "Review submissions before deadlines.",
    ],
    keyPoints: [
      "You remain legally responsible for your tax return even if an agent files it.",
      "Check your agent is regulated (e.g. ICAEW, ACCA, AAT) where applicable.",
    ],
    hmrcLinks: [
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
      { label: "Find a tax adviser", url: "https://www.gov.uk/guidance/getting-an-agent" },
    ],
  },
  {
    id: 20,
    slug: "help-and-support",
    title: "Help & Support",
    icon: HelpCircle,
    summary:
      "HMRC offers web guidance, webinars, and helplines — get help early if you are unsure.",
    whatItIs:
      "HMRC publishes detailed guidance on GOV.UK, runs webinars for MTD, and provides helplines for Self Assessment and VAT. Complex cases may need professional advice from a qualified accountant.",
    whoItAppliesTo:
      "Everyone in MTD — especially when starting out or changing business structure.",
    whatYouNeedToDo: [
      "Read the relevant GOV.UK collection for your situation.",
      "Attend HMRC webinars for MTD for Income Tax.",
      "Contact HMRC if you cannot meet a deadline. Do not leave correspondence unaddressed.",
    ],
    keyPoints: [
      "SelfSubmit helps organise records and submissions — it does not replace HMRC guidance or professional advice.",
      "Always verify rule changes on GOV.UK.",
    ],
    hmrcLinks: [
      { label: "HMRC webinars", url: "https://www.gov.uk/guidance/hmrc-webinars-email-alerts-and-videos" },
      { label: "Self Assessment helpline", url: "https://www.gov.uk/government/organisations/hm-revenue-customs/contact/self-assessment" },
      { label: "GOV.UK — Making Tax Digital for Income Tax", url: "https://www.gov.uk/government/collections/making-tax-digital-for-income-tax-for-businesses-step-by-step" },
    ],
  },
];

export function getCategoryBySlug(slug: string): MtdCategoryContent | undefined {
  return MTD_CATEGORY_CONTENT.find((c) => c.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return MTD_CATEGORY_CONTENT.map((c) => c.slug);
}
