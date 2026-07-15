/** Browser-side fraud-prevention context for HMRC MTD calls. */

const DEVICE_ID_KEY = "hmrc_device_id";

export function getOrCreateHmrcDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function formatHmrcTimezone(): string {
  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const mins = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${hours}:${mins}`;
}

export function collectHmrcFraudContext() {
  const screen = window.screen;
  return {
    deviceId: getOrCreateHmrcDeviceId(),
    browserJsUserAgent: navigator.userAgent,
    screens: `width=${screen.width}&height=${screen.height}&scaling-factor=${window.devicePixelRatio || 1}&colour-depth=${screen.colorDepth}`,
    windowSize: `width=${window.innerWidth}&height=${window.innerHeight}`,
    timezone: formatHmrcTimezone(),
  };
}

/** Refresh the signed fraud-context cookie before any HMRC API call. */
export async function ensureHmrcFraudContext(): Promise<boolean> {
  const res = await fetch("/api/hmrc/fraud-context", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collectHmrcFraudContext()),
  });
  return res.ok;
}
