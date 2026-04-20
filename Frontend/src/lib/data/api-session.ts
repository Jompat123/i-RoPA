import { getApiBaseUrl, getAuthTokenFromCookie } from "./runtime";

export type LiveApiSession =
  | { ok: true; base: string; token: string }
  | { ok: false; error: string };

/**
 * ใช้เมื่อต้องการโหลดข้อมูลจริง (ไม่ใช่ USE_MOCK_DATA)
 */
export async function getLiveApiSession(): Promise<LiveApiSession> {
  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base?.trim()) {
    return { ok: false, error: "ยังไม่ได้กำหนด NEXT_PUBLIC_API_URL (หรือ API_URL)" };
  }
  if (!token) {
    return { ok: false, error: "ไม่พบ session — ลองเข้าสู่ระบบใหม่" };
  }
  return { ok: true, base: base.trim(), token };
}
