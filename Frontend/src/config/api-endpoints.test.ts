import { afterEach, describe, expect, it } from "vitest";

import {
  apiPathAdminDashboardSummary,
  apiPathAuthLogin,
  apiPathDataOwnerDashboardSummary,
  apiPathRopaItem,
  apiPathRopaList,
  apiPathUserItem,
  apiPathUsers,
} from "./api-endpoints";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("api-endpoints", () => {
  it("uses defaults when env is missing", () => {
    delete process.env.NEXT_PUBLIC_API_ROPA_PATH;
    delete process.env.NEXT_PUBLIC_API_USERS_PATH;
    expect(apiPathRopaList()).toBe("/api/ropa");
    expect(apiPathUsers()).toBe("/api/users");
    expect(apiPathRopaItem("a b")).toBe("/api/ropa/a%20b");
    expect(apiPathUserItem("u/1")).toBe("/api/users/u%2F1");
  });

  it("uses env overrides and normalizes slash", () => {
    process.env.NEXT_PUBLIC_API_ROPA_PATH = "v2/ropa";
    process.env.NEXT_PUBLIC_API_USERS_PATH = "/v2/users";
    process.env.NEXT_PUBLIC_API_DATA_OWNER_DASHBOARD_SUMMARY_PATH = "dashboard/overview";
    process.env.NEXT_PUBLIC_API_ADMIN_DASHBOARD_SUMMARY_PATH = "admin/summary";
    process.env.AUTH_LOGIN_PATH = "auth/sign-in";

    expect(apiPathRopaList()).toBe("/v2/ropa");
    expect(apiPathUsers()).toBe("/v2/users");
    expect(apiPathDataOwnerDashboardSummary()).toBe("/dashboard/overview");
    expect(apiPathAdminDashboardSummary()).toBe("/admin/summary");
    expect(apiPathAuthLogin()).toBe("/auth/sign-in");
  });
});
