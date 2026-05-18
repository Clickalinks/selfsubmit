import { auth } from "@clerk/nextjs/server";
import archiver from "archiver";
import { access } from "fs/promises";
import { PassThrough, Readable } from "stream";

import { prisma } from "@/lib/db";
import { getClientProfile } from "@/lib/profile-server";
import { receiptFilePath } from "@/lib/receipt-storage";

const README = `SelfSubmit data export
======================

This archive contains your account data at the time of export.

Contents:
- profile.json — personal and business details
- businesses.json — businesses linked to your account
- submissions.json — submission history
- receipts/ — receipt photos and documents uploaded to your account

Keep this file safe if you need your records after leaving SelfSubmit.
`;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const profile = await getClientProfile(userId);
  if (!profile) {
    return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404 });
  }

  const [businesses, submissions, receipts] = await Promise.all([
    prisma.business.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.submission.findMany({ where: { userId }, orderBy: { submittedAt: "desc" } }),
    prisma.receipt.findMany({ where: { userId }, orderBy: { uploadedAt: "desc" } }),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    profile: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      homeAddress: profile.homeAddress,
      email: profile.email,
      phone: profile.phone,
      businessAddress: profile.businessAddress,
      businessName: profile.businessName,
      businessSameAsHome: profile.businessSameAsHome,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    },
    businesses: businesses.map((b) => ({
      id: b.id,
      name: b.name,
      category: b.category,
      createdAt: b.createdAt.toISOString(),
    })),
    submissions: submissions.map((s) => ({
      id: s.id,
      submissionType: s.submissionType,
      status: s.status,
      submittedAt: s.submittedAt.toISOString(),
      details: s.details,
    })),
    receipts: receipts.map((r) => ({
      id: r.id,
      fileName: r.fileName,
      title: r.title,
      mimeType: r.mimeType,
      uploadedAt: r.uploadedAt.toISOString(),
      archivePath: `receipts/${r.id}-${r.fileName}`,
    })),
  };

  const passThrough = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", (err) => {
    passThrough.destroy(err);
  });

  archive.pipe(passThrough);

  archive.append(README, { name: "README.txt" });
  archive.append(JSON.stringify(exportPayload, null, 2), { name: "data.json" });
  archive.append(JSON.stringify(exportPayload.profile, null, 2), { name: "profile.json" });
  archive.append(JSON.stringify(exportPayload.businesses, null, 2), { name: "businesses.json" });
  archive.append(JSON.stringify(exportPayload.submissions, null, 2), { name: "submissions.json" });

  for (const receipt of receipts) {
    const filePath = receiptFilePath(userId, receipt.storagePath);
    const safeName = `${receipt.id}-${receipt.fileName.replace(/[^\w.\-()+ ]/g, "_")}`;
    try {
      await access(filePath);
      archive.file(filePath, { name: `receipts/${safeName}` });
    } catch {
      // Skip missing files on disk
    }
  }

  void archive.finalize();

  const webStream = Readable.toWeb(passThrough) as ReadableStream<Uint8Array>;
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="selfsubmit-export-${stamp}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
