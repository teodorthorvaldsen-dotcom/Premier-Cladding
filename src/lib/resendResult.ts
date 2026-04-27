/**
 * Resend `emails.send` resolves to `{ data, error }` (success: `error === null` and
 * `data` holds `{ id }`). Prefer `data.id`, and fall back to `error === null` with
 * non-null `data` so we do not surface a hard failure when the API accepted the send.
 */
export function resendEmailAccepted(result: {
  data?: { id?: string } | null;
  error?: unknown;
}): boolean {
  if (Boolean(result.data?.id)) return true;
  const noError = result.error === null || result.error === undefined;
  return noError && result.data != null;
}
