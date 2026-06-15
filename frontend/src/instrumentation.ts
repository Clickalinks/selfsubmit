export async function register() {
  const { reconcileClerkProxyEnv } = await import("./lib/clerk-env");
  reconcileClerkProxyEnv();
}
