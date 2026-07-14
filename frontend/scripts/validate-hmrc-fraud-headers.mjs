/**
 * Validate SelfSubmit fraud-prevention headers against HMRC's sandbox Test API.
 *
 * Prereqs:
 * 1. Sandbox app subscribed to "Test Fraud Prevention Headers"
 * 2. HMRC_CLIENT_ID / HMRC_CLIENT_SECRET / HMRC_API_BASE in .env.local (sandbox)
 *
 * Run from frontend/:
 *   node --env-file=.env.local scripts/validate-hmrc-fraud-headers.mjs
 */
import { createHash } from "node:crypto";

const apiBase = (process.env.HMRC_API_BASE ?? "https://test-api.service.hmrc.gov.uk").replace(/\/$/, "");
const clientId = process.env.HMRC_CLIENT_ID?.trim();
const clientSecret = process.env.HMRC_CLIENT_SECRET?.trim();

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
  const publicIp = "198.51.100.0"; // TEST-NET — replace mentally with real public IP in live traffic
  const userKey = createHash("sha256").update("fraud-header-validation").digest("hex");
  const mfaTimestamp = formatUtcTimestamp(now).replace(".000Z", "Z");

  return {
    "Gov-Client-Connection-Method": "WEB_APP_VIA_SERVER",
    "Gov-Vendor-Product-Name": percentEncode("SelfSubmit"),
    "Gov-Vendor-Version": "selfsubmit=1.0.0",
    "Gov-Client-Public-IP": publicIp,
    "Gov-Client-Public-IP-Timestamp": formatUtcTimestamp(now),
    "Gov-Client-Public-Port": "12345",
    "Gov-Vendor-Public-IP": publicIp,
    "Gov-Vendor-Forwarded": `by=${encodeURIComponent(publicIp)}&for=${encodeURIComponent(publicIp)}`,
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

async function main() {
  console.log("Getting application token (client_credentials)…");
  const token = await getClientCredentialsToken();

  const fph = buildHeaders();
  console.log("\nSubmitting SelfSubmit-style Gov-* headers to validate…\n");

  // Docs path: GET /test/fraud-prevention-headers/validate (some docs show /test-fraud-prevention-headers/validate)
  const paths = [
    "/test/fraud-prevention-headers/validate",
    "/test-fraud-prevention-headers/validate",
  ];

  let res;
  let payload;
  let usedPath = paths[0];
  for (const path of paths) {
    usedPath = path;
    res = await fetch(`${apiBase}${path}`, {
      method: "GET",
      headers: {
        Accept: "application/vnd.hmrc.1.0+json",
        Authorization: `Bearer ${token}`,
        ...fph,
      },
    });
    const text = await res.text();
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
    if (res.status !== 404) break;
  }

  console.log("Path", usedPath);
  console.log("HTTP", res.status);
  console.log(JSON.stringify(payload, null, 2));

  if (typeof payload === "object" && payload && payload.code === "INVALID_HEADERS") {
    console.log("\nResult: headers need fixes — read errors/warnings above.");
    process.exit(2);
  }

  console.log("\nDone. Review any warnings/advisories and fix errors before answering Yes on the HMRC form.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
