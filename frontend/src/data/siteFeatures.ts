import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Calculator,
  FileSpreadsheet,
  FileText,
  History,
  Receipt,
  ShieldCheck,
  Smartphone,
  Upload,
} from "lucide-react";

import { PLAN_INCLUDED_FEATURES } from "@/lib/plan-config";

export type SiteFeature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const SITE_FEATURE_GROUPS: { title: string; features: SiteFeature[] }[] = [
  {
    title: "Record keeping",
    features: [
      {
        id: "income-expenses",
        title: "Income & expense tracking",
        description:
          "Capture each period in one structured form with totals that roll up for your quarterly MTD update.",
        icon: FileText,
      },
      {
        id: "profession-forms",
        title: "Profession-tailored categories",
        description:
          "Choose your trade when you add a business — income and expense lines match how you actually work.",
        icon: Building2,
      },
      {
        id: "mileage",
        title: "Vehicle & mileage support",
        description:
          "Record actual vehicle costs or HMRC simplified mileage where allowed, with guidance not to mix methods.",
        icon: Calculator,
      },
      {
        id: "csv",
        title: "CSV uploads",
        description: "Import spreadsheet data where it saves time, alongside manual line-by-line entry.",
        icon: FileSpreadsheet,
      },
    ],
  },
  {
    title: "MTD & submissions",
    features: [
      {
        id: "quarterly",
        title: "MTD submission preparation",
        description:
          "Roll monthly records into figures ready for quarterly updates. Submit to HMRC when your account is connected.",
        icon: Upload,
      },
      {
        id: "final-declaration",
        title: "Final declaration support",
        description: "End-of-year confirmation support as HMRC final declaration flows are completed.",
        icon: ShieldCheck,
      },
      {
        id: "history",
        title: "Submission history",
        description: "Review saved records and exports — useful for you and your accountant.",
        icon: History,
      },
      {
        id: "mtd-dashboard",
        title: "MTD compliance dashboard",
        description: "See deadlines, progress, and what still needs attention across your businesses.",
        icon: Bell,
      },
    ],
  },
  {
    title: "Documents & reminders",
    features: [
      {
        id: "receipts",
        title: "Receipt uploads",
        description: "Attach evidence to expenses and keep documents stored with your records.",
        icon: Receipt,
      },
      {
        id: "storage",
        title: "Secure document storage",
        description: "Receipts and submission data kept in your account for HMRC’s typical six-year expectation.",
        icon: ShieldCheck,
      },
      {
        id: "reminders",
        title: "Deadline reminders",
        description: "Email and optional SMS reminders ahead of quarterly deadlines.",
        icon: Bell,
      },
      {
        id: "mobile",
        title: "Mobile access",
        description: "Update records from your phone — designed for busy self-employed schedules.",
        icon: Smartphone,
      },
    ],
  },
];

export const ALL_PLAN_FEATURES = PLAN_INCLUDED_FEATURES;
