/** Short human label for login history (not fingerprinting). */
export function describeUserAgent(userAgent: string | null | undefined): string {
  if (!userAgent?.trim()) return "Unknown device";

  const ua = userAgent;
  let device = "Desktop";
  if (/iPhone|iPad|iPod/i.test(ua)) device = "Apple mobile";
  else if (/Android/i.test(ua)) device = "Android";
  else if (/Windows/i.test(ua)) device = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) device = "Mac";

  let browser = "Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";

  return `${device} · ${browser}`;
}
