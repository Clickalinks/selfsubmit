import { timingSafeEqual } from "crypto";

/**
 * Headers added by the Cloudflare Request Header Transform Rule in front of Vercel.
 * Only trusted when the shared secret matches, so requests that bypass Cloudflare
 * (e.g. *.vercel.app) cannot spoof the client port or IP.
 */
const EDGE_SECRET_HEADER = "x-selfsubmit-edge-secret";
const CLIENT_PORT_HEADER = "x-selfsubmit-client-port";
const EDGE_IP_HEADER = "x-selfsubmit-edge-ip";

export type CloudflareEdgeInfo = {
  clientIp: string | null;
  clientPort: string | null;
  edgeIp: string | null;
  /** Cloudflare egress IP as seen by Vercel (second internet hop). */
  proxyEgressIp: string | null;
};

function secretsMatch(received: string, expected: string): boolean {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function isClientTcpPort(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= 65535 && n !== 80 && n !== 443;
}

function isIp(value: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(value) || /^[0-9a-f:]+$/i.test(value);
}

function cleanIp(raw: string | null): string | null {
  const value = raw?.split(",")[0]?.trim() ?? "";
  return value && isIp(value) ? value : null;
}

export function getCloudflareEdgeInfo(request: Request): CloudflareEdgeInfo | null {
  const expected = process.env.CLOUDFLARE_EDGE_SECRET?.trim();
  const received = request.headers.get(EDGE_SECRET_HEADER)?.trim();
  if (!expected || !received || !secretsMatch(received, expected)) return null;

  const portRaw = request.headers.get(CLIENT_PORT_HEADER)?.trim() ?? "";
  const port = Number.parseInt(portRaw, 10);

  return {
    clientIp: cleanIp(request.headers.get("cf-connecting-ip")),
    clientPort: /^\d{1,5}$/.test(portRaw) && isClientTcpPort(port) ? String(port) : null,
    edgeIp: cleanIp(request.headers.get(EDGE_IP_HEADER)),
    proxyEgressIp: cleanIp(request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")),
  };
}
