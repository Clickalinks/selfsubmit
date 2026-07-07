import { prisma } from "@/lib/db";
import { decryptField, encryptField, isEncryptionConfigured } from "@/lib/field-encryption";
import { refreshHmrcAccessToken } from "@/lib/hmrc-oauth";

export type HmrcConnectionStatus = {
  connected: boolean;
  configured: boolean;
  scopes: string | null;
  tokenExpiresAt: string | null;
  connectedAt: string | null;
};

export async function getHmrcConnectionStatus(userId: string): Promise<HmrcConnectionStatus> {
  const row = await prisma.hmrcConnection.findUnique({ where: { userId } });
  if (!row) {
    return {
      connected: false,
      configured: isEncryptionConfigured(),
      scopes: null,
      tokenExpiresAt: null,
      connectedAt: null,
    };
  }

  return {
    connected: true,
    configured: isEncryptionConfigured(),
    scopes: row.scopes,
    tokenExpiresAt: row.tokenExpiresAt?.toISOString() ?? null,
    connectedAt: row.createdAt.toISOString(),
  };
}

export async function saveHmrcConnection(
  userId: string,
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresInSec: number;
    scope: string;
  },
): Promise<void> {
  if (!isEncryptionConfigured()) {
    throw new Error("ENCRYPTION_KEY is not configured — cannot store HMRC tokens.");
  }

  const tokenExpiresAt = new Date(Date.now() + tokens.expiresInSec * 1000);

  await prisma.hmrcConnection.upsert({
    where: { userId },
    create: {
      userId,
      accessTokenEncrypted: encryptField(tokens.accessToken),
      refreshTokenEncrypted: encryptField(tokens.refreshToken),
      tokenExpiresAt,
      scopes: tokens.scope,
    },
    update: {
      accessTokenEncrypted: encryptField(tokens.accessToken),
      refreshTokenEncrypted: encryptField(tokens.refreshToken),
      tokenExpiresAt,
      scopes: tokens.scope,
    },
  });
}

export async function deleteHmrcConnection(userId: string): Promise<void> {
  await prisma.hmrcConnection.deleteMany({ where: { userId } });
}

async function getConnectionRow(userId: string) {
  return prisma.hmrcConnection.findUnique({ where: { userId } });
}

/** Returns a valid HMRC access token, refreshing when close to expiry. */
export async function getHmrcAccessToken(userId: string): Promise<string> {
  const row = await getConnectionRow(userId);
  if (!row) {
    throw new Error("HMRC account is not connected.");
  }

  const refreshToken = decryptField(row.refreshTokenEncrypted);
  const expiresAt = row.tokenExpiresAt?.getTime() ?? 0;
  const needsRefresh = expiresAt - Date.now() < 5 * 60 * 1000;

  if (!needsRefresh) {
    return decryptField(row.accessTokenEncrypted);
  }

  const refreshed = await refreshHmrcAccessToken(refreshToken);
  await saveHmrcConnection(userId, {
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token ?? refreshToken,
    expiresInSec: refreshed.expires_in,
    scope: refreshed.scope,
  });

  return refreshed.access_token;
}
