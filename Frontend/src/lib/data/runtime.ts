import { cookies } from "next/headers";

const AUTH_TOKEN_COOKIE = "auth_token";

export function shouldUseMockData(): boolean {
  const value = (process.env.USE_MOCK_DATA ?? process.env.NEXT_PUBLIC_USE_MOCK_DATA ?? "").toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function getApiBaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
  const trimmed = url.replace(/\/$/, "");
  return trimmed || null;
}

export async function getAuthTokenFromCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}
