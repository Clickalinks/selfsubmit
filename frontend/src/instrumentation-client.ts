import * as Sentry from "@sentry/nextjs";

import { SENTRY_IGNORE_ERRORS } from "@/lib/sentry-filters";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  sendDefaultPii: false,
  ignoreErrors: SENTRY_IGNORE_ERRORS,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
