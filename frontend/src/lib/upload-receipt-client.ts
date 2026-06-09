export type UploadedReceiptMeta = {
  id: string;
  fileName: string;
  title: string | null;
  uploadedAt: string;
};

export async function uploadReceiptFile(params: {
  file: File;
  title?: string | null;
  amountGbp?: number | null;
}): Promise<UploadedReceiptMeta> {
  const formData = new FormData();
  formData.append("file", params.file);
  if (params.title) formData.append("title", params.title);
  if (params.amountGbp != null && Number.isFinite(params.amountGbp)) {
    formData.append("amountGbp", String(params.amountGbp));
  }

  const res = await fetch("/api/receipts", { method: "POST", body: formData });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    receipt?: UploadedReceiptMeta;
  };
  if (!res.ok || !data.receipt) {
    throw new Error(data.error ?? "Could not upload receipt");
  }
  return data.receipt;
}
