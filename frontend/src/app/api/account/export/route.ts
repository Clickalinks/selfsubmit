import { auth } from "@clerk/nextjs/server";

import { API_RATE_LIMITS, checkApiRateLimit, rateLimitKey } from "@/lib/api-rate-limit";
import { prisma } from "@/lib/db";
import { buildZipBuffer } from "@/lib/export-zip";
import { getClientProfile } from "@/lib/profile-server";
import { readReceiptFileBuffer } from "@/lib/receipt-storage";

export const maxDuration = 60;

const README = `SelfSubmit data export
======================

This archive contains your account data at the time of export.

Contents:
- profile.json — personal and business details (if saved)
- businesses.json — businesses linked to your account
- submissions.json — submission history with line-item detail
- receipts/ — receipt photos and documents uploaded to your account

Keep this file safe if you need your records after leaving SelfSubmit.
`;

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

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      profile: profile
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
            createdAt: profile.createdAt.toISOString(),
            updatedAt: profile.updatedAt.toISOString(),
          }
        : null,
      businesses: businesses.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.category,
        createdAt: b.createdAt.toISOString(),
      })),
      submissions: submissions.map((s) => ({
        id: s.id,
        trade: s.trade,
        periodFrom: s.periodFrom.toISOString().slice(0, 10),
        periodTo: s.periodTo.toISOString().slice(0, 10),
        templateId: s.templateId,
        submissionType: s.submissionType,
        status: s.status,
        totalIncomeGbp: s.totalIncomeGbp,
        totalExpensesGbp: s.totalExpensesGbp,
        netProfitGbp: s.netProfitGbp,
        hmrcReference: s.hmrcReference,
        hmrcStatus: s.hmrcStatus,
        hmrcMessage: s.hmrcMessage,
        submittedAt: s.submittedAt.toISOString(),
        payloadJson: s.payloadJson,
      })),
      receipts: receipts.map((r) => ({
        id: r.id,
        fileName: r.fileName,
        title: r.title,
        mimeType: r.mimeType,
        amountGbp: r.amountGbp,
        submissionId: r.submissionId,
        uploadedAt: r.uploadedAt.toISOString(),
        archivePath: `receipts/${r.id}-${r.fileName}`,
      })),
    };

    const zipBuffer = await buildZipBuffer(async (archive) => {
      archive.append(README, { name: "README.txt" });
      archive.append(JSON.stringify(exportPayload, null, 2), { name: "data.json" });
      archive.append(JSON.stringify(exportPayload.profile, null, 2), { name: "profile.json" });
      archive.append(JSON.stringify(exportPayload.businesses, null, 2), { name: "businesses.json" });
      archive.append(JSON.stringify(exportPayload.submissions, null, 2), { name: "submissions.json" });

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
        "Content-Disposition": `attachment; filename="selfsubmit-export-${stamp}.zip"`,
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[account-export]", err);
    return Response.json({ error: "Could not build your export. Please try again." }, { status: 500 });
  }
}
