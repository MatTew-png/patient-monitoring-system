import { describe, it, expect } from "vitest";
import { useAuthStore } from "../store/authStore";
import { MOCK_USERS } from "../services/mockData";

describe("🔐 Authentication & Role-Based Access Control (RBAC) Test Suite", () => {
  it("TC-AUTH-001: should default to authenticated Admin credentials in demo mode", () => {
    const { token, currentUser } = useAuthStore.getState();
    expect(token).toBeDefined();
    expect(token).toContain("admin");
    expect(currentUser?.position).toBe("Admin");
    expect(currentUser?.ward_id).toBe(1);
  });

  it("TC-AUTH-002: should verify healthcare personnel staff records", () => {
    expect(MOCK_USERS.length).toBeGreaterThanOrEqual(3);
    const admin = MOCK_USERS.find((u) => u.user_position === "Admin");
    const doctor = MOCK_USERS.find((u) => u.user_position === "Doctor");
    const nurse = MOCK_USERS.find((u) => u.user_position === "Nurse");

    expect(admin).toBeDefined();
    expect(admin?.user_name).toContain("MatTew");
    expect(doctor).toBeDefined();
    expect(nurse).toBeDefined();
  });

  it("TC-AUTH-003: should set and clear authentication state accurately", () => {
    const store = useAuthStore.getState();
    store.setAuth("custom-jwt-token-xyz", "bearer", 99);
    expect(useAuthStore.getState().token).toBe("custom-jwt-token-xyz");
    expect(useAuthStore.getState().userId).toBe(99);

    store.clearAuth();
    expect(useAuthStore.getState().currentUser?.position).toBe("Admin");
  });
});
