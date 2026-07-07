import { auth } from "@clerk/nextjs/server";

import {
  ACCOUNT_EXPORT_README,
  formatBusinessesText,
  formatProfileText,
  formatSubmissionText,
  parseSubmissionPayload,
  submissionArchiveName,
} from "@/lib/account-export-format";
import { API_RATE_LIMITS, checkApiRateLimit, rateLimitKey } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/db";
import { buildZipBuffer } from "@/lib/export-zip";
import { getClientProfile } from "@/lib/profile-server";
import { readReceiptFileBuffer } from "@/lib/receipt-storage";

export const maxDuration = 60;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkApiRateLimit({
    key: rateLimitKey("account-export", userId),
    ...API_RATE_LIMITS.export,
  });
  if (!limited.allowed) {
    return Response.json(
      { error: "Too many export requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  try {
    const profile = await getClientProfile(userId);
    const [businesses, submissions, receipts] = await Promise.all([
      prisma.business.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.submission.findMany({ where: { userId }, orderBy: { submittedAt: "desc" } }),
      prisma.receipt.findMany({ where: { userId }, orderBy: { uploadedAt: "desc" } }),
    ]);

    const profileExport = profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          homeAddress: profile.homeAddress,
          email: profile.email,
          phone: profile.phone,
          businessAddress: profile.businessAddress,
          businessName: profile.businessName,
          businessSameAsHome: profile.businessSameAsHome,
          primaryProfession: profile.primaryProfession,
        }
      : null;

    const businessesExport = businesses.map((b) => ({
      name: b.name,
      category: b.category,
      createdAt: b.createdAt.toISOString(),
    }));

    const submissionsExport = submissions.map((s) => {
      const { income, expenses } = parseSubmissionPayload(s.payloadJson);
      return {
        trade: s.trade,
        periodFrom: s.periodFrom.toISOString().slice(0, 10),
        periodTo: s.periodTo.toISOString().slice(0, 10),
        submittedAt: s.submittedAt.toISOString(),
        status: s.status,
        totalIncomeGbp: s.totalIncomeGbp,
        totalExpensesGbp: s.totalExpensesGbp,
        netProfitGbp: s.netProfitGbp,
        hmrcReference: s.hmrcReference,
        hmrcStatus: s.hmrcStatus,
        income,
        expenses,
      };
    });

    const zipBuffer = await buildZipBuffer(async (archive) => {
      archive.append(ACCOUNT_EXPORT_README, { name: "README.txt" });
      archive.append(formatProfileText(profileExport), { name: "profile.txt" });
      archive.append(formatBusinessesText(businessesExport), { name: "businesses.txt" });

      for (const submission of submissionsExport) {
        archive.append(formatSubmissionText(submission), {
          name: `submissions/${submissionArchiveName(submission)}`,
        });
      }

      for (const receipt of receipts) {
        const safeName = `${receipt.id}-${receipt.fileName.replace(/[^\w.\-()+ ]/g, "_")}`;
        try {
          const fileBuffer = await readReceiptFileBuffer(userId, receipt.storagePath);
          if (fileBuffer) {
            archive.append(fileBuffer, { name: `receipts/${safeName}` });
          }
        } catch (err) {
          console.warn("[account-export] skipped receipt", receipt.id, err);
        }
      }
    });

    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="selfsubmit-my-records-${stamp}.zip"`,
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[account-export]", err);
    return Response.json({ error: "Could not build your export. Please try again." }, { status: 500 });
  }
}
