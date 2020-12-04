export function reportSentry() {
  Sentry.captureException(new Error('Good bye'));
}
