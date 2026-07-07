export function isSetupComplete(snapshot: {
  hasPlan: boolean;
  hasBusiness: boolean;
  hasTaxIds: boolean;
  hmrcSandboxReady: boolean;
}): boolean {
  return (
    snapshot.hasPlan &&
    snapshot.hasBusiness &&
    snapshot.hasTaxIds &&
    snapshot.hmrcSandboxReady
  );
}

export type SetupStepId = 2 | 3 | 4 | 5 | 6 | 7;

export function getActiveSetupStep(snapshot: {
  hasPlan: boolean;
  hasBusiness: boolean;
  hasTaxIds: boolean;
  hmrcConnected: boolean;
  activeBusinessHmrcId: string | null;
}): SetupStepId {
  if (!snapshot.hasPlan) return 2;
  if (!snapshot.hasBusiness) return 3;
  if (!snapshot.hasTaxIds) return 4;
  if (!snapshot.hmrcConnected) return 5;
  if (!snapshot.activeBusinessHmrcId) return 6;
  return 7;
}
