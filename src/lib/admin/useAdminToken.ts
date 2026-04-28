"use client";

import { useSession } from "next-auth/react";

/**
 * Returns the Google ID token from the next-auth session,
 * used as Bearer token for GEX44 admin API calls.
 */
export function useAdminToken(): string | null {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session as any)?.id_token ?? null;
}
