/**
 * Validate SelfSubmit fraud-prevention headers against HMRC's sandbox Test API.
 *
 * HMRC Production review uses your most recent sandbox API submissions (with Gov-*
 * headers). Use validate for a quick check; use validation-feedback after real
 * sandbox MTD calls from SelfSubmit.
 *
 * Prereqs:
 * 1. Sandbox app "SelfSubmit" subscribed to "Test Fraud Prevention Headers"
 * 2. Same sandbox app subscribed to Obligations / Self Employment / Business Details
 * 3. HMRC_CLIENT_ID / HMRC_CLIENT_SECRET / HMRC_API_BASE in .env.local (sandbox)
 *
 * Run from frontend/:
 *   node --env-file=.env.local scripts/validate-hmrc-fraud-headers.mjs
 *   node --env-file=.env.local scripts/validate-hmrc-fraud-headers.mjs --feedback
 */
import { createHash } from "node:crypto";

const apiBase = (process.env.HMRC_API_BASE ?? "https://test-api.service.hmrc.gov.uk").replace(/\/$/, "");
const clientId = process.env.HMRC_CLIENT_ID?.trim();
const clientSecret = process.env.HMRC_CLIENT_SECRET?.trim();
const wantFeedback = process.argv.includes("--feedback");

if (!clientId || !clientSecret) {
  console.error("Missing HMRC_CLIENT_ID or HMRC_CLIENT_SECRET in env.");
  process.exit(1);
}

function percentEncode(value) {
  return encodeURIComponent(value);
}

function formatUtcTimestamp(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, ".000Z");
}

function buildHeaders() {
  const now = new Date();
  const clientPublicIp = "198.51.100.0"; // TEST-NET — used for Gov-Client-Public-IP
  const vendorPublicIp = "203.0.113.0"; // TEST-NET-3 — used for Gov-Vendor-Public-IP
  const userKey = createHash("sha256").update("fraud-header-validation").digest("hex");
  const mfaTimestamp = formatUtcTimestamp(now).replace(".000Z", "Z");

  return {
    "Gov-Client-Connection-Method": "WEB_APP_VIA_SERVER",
    "Gov-Vendor-Product-Name": percentEncode("SelfSubmit"),
    "Gov-Vendor-Version": "selfsubmit=1.0.0",
    "Gov-Client-Public-IP": clientPublicIp,
    "Gov-Client-Public-IP-Timestamp": formatUtcTimestamp(now),
    // Avoid the spec example value (12345) that HMRC flagged.
    "Gov-Client-Public-Port": "443",
    "Gov-Vendor-Public-IP": vendorPublicIp,
    "Gov-Vendor-Forwarded": `by=${encodeURIComponent(vendorPublicIp)}&for=${encodeURIComponent(clientPublicIp)}`,
    "Gov-Vendor-License-IDs": `selfsubmit=${createHash("sha256").update("selfsubmit-saas-license-v1").digest("hex").toUpperCase()}`,
    "Gov-Client-Browser-JS-User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Gov-Client-Device-ID": "00000000-0000-4000-8000-000000000001",
    "Gov-Client-Screens": "width=1920&height=1080&scaling-factor=1&colour-depth=24",
    "Gov-Client-Window-Size": "width=1280&height=800",
    "Gov-Client-Timezone": "UTC+01:00",
    "Gov-Client-User-IDs": `selfsubmit=${percentEncode(userKey)}`,
    "Gov-Client-Multi-Factor": `type=OTHER&timestamp=${encodeURIComponent(mfaTimestamp)}&unique-reference=${userKey}`,
  };
}

async function getClientCredentialsToken() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${apiBase}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(`Token failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

async function getJson(path, token, extraHeaders = {}) {
  const res = await fetch(`${apiBase}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/vnd.hmrc.1.0+json",
      Authorization: `Bearer ${token}`,
      ...extraHeaders,
    },
  });
  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }
  return { res, payload };
}

async function runValidate(token) {
  const fph = buildHeaders();
  console.log("\n=== 1) Validate (single request check) ===\n");

  const paths = [
    "/test/fraud-prevention-headers/validate",
    "/test-fraud-prevention-headers/validate",
  ];

  let result;
  for (const path of paths) {
    result = await getJson(path, token, fph);
    console.log("Path", path);
    console.log("HTTP", result.res.status);
    console.log(JSON.stringify(result.payload, null, 2));
    if (result.res.status !== 404) break;
  }

  if (typeof result.payload === "object" && result.payload?.code === "INVALID_HEADERS") {
    console.log("\nResult: headers need fixes — read errors/warnings above.");
    return false;
  }
  if (result.res.ok && typeof result.payload === "object" && result.payload?.code === "VALID_HEADERS") {
    console.log("\nResult: VALID_HEADERS");
    return true;
  }
  console.log("\nResult: unexpected — fix subscription / path / credentials if needed.");
  return false;
}

async function runFeedback(token) {
  // APIs SelfSubmit actually hits in sandbox (Income Tax MTD flow)
  const apis = [
    "obligations-mtd",
    "self-employment-business-mtd",
    "business-details-mtd",
  ];

  console.log("\n=== 2) Validation feedback (last real sandbox submissions) ===");
  console.log("HMRC looks at these when reviewing Production credentials.\n");
  console.log("connectionMethod=WEB_APP_VIA_SERVER\n");

  let anyFound = false;
  let anyErrors = false;

  for (const api of apis) {
    const path = `/test/fraud-prevention-headers/${api}/validation-feedback?connectionMethod=WEB_APP_VIA_SERVER`;
    const { res, payload } = await getJson(path, token);
    console.log(`--- ${api} ---`);
    console.log("HTTP", res.status);
    console.log(JSON.stringify(payload, null, 2));
    console.log("");

    if (res.ok && typeof payload === "object" && Array.isArray(payload.requests) && payload.requests.length > 0) {
      anyFound = true;
      for (const req of payload.requests) {
        const errors = req.errors ?? req.headerErrors ?? [];
        if (Array.isArray(errors) && errors.length > 0) anyErrors = true;
        if (req.code === "INVALID_HEADERS") anyErrors = true;
      }
    }
  }

  if (!anyFound) {
    console.log(
      "No prior sandbox submissions found for these APIs.\n" +
        "Do this next: sign in to SelfSubmit, Connect HMRC (sandbox), Fetch obligations\n" +
        "(and optionally submit a quarterly update), then re-run with --feedback.",
    );
    return false;
  }
  if (anyErrors) {
    console.log("Feedback found header errors — fix and generate new sandbox traffic, then re-check.");
    return false;
  }
  console.log("Feedback returned prior requests with no hard errors detected in summary.");
  console.log("Still read each response for warnings/advisories before re-applying.");
  return true;
}

async function main() {
  console.log("Getting application token (client_credentials)…");
  const token = await getClientCredentialsToken();

  const validateOk = await runValidate(token);
  if (!validateOk) process.exit(2);

  if (wantFeedback) {
    const feedbackOk = await runFeedback(token);
    if (!feedbackOk) process.exit(3);
  } else {
    console.log("\nTip: after real sandbox MTD calls from SelfSubmit, run:");
    console.log("  node --env-file=.env.local scripts/validate-hmrc-fraud-headers.mjs --feedback");
  }

  console.log("\nDone. Keep this terminal output as evidence for your re-application.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
