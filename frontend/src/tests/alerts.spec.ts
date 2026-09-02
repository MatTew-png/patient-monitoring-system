import { describe, it, expect } from "vitest";
import { MOCK_NOTIFICATIONS } from "../services/mockData";
import { useNotificationStore } from "../store/notificationStore";

describe("🚨 Emergency & SOS Nurse Alert Triage Test Suite", () => {
  it("TC-ALERT-001: should initialize with active Emergency and SOS alarm payloads", () => {
    expect(MOCK_NOTIFICATIONS.length).toBeGreaterThanOrEqual(2);
    const emergencyNoti = MOCK_NOTIFICATIONS.find((n) => n.notification_category === "Emergency");
    const sosNoti = MOCK_NOTIFICATIONS.find((n) => n.notification_category === "SOS");

    expect(emergencyNoti).toBeDefined();
    expect(emergencyNoti?.notification_accepted).toBe(false);
    expect(sosNoti).toBeDefined();
    expect(sosNoti?.notification_accepted).toBe(false);
  });

  it("TC-ALERT-002: should handle notification state transitions (Move to Accepted)", () => {
    const store = useNotificationStore.getState();
    expect(store.emergencyDatas.length).toBeGreaterThanOrEqual(1);

    const initialEmerId = store.emergencyDatas[0].notification_id;
    store.moveToAccepted(initialEmerId, "emergency");

    const stateAfter = useNotificationStore.getState();
    const acceptedItem = stateAfter.emergencyDataWithAccepted.find((n) => n.notification_id === initialEmerId);
    expect(acceptedItem).toBeDefined();
    expect(acceptedItem?.notification_accepted).toBe(true);
  });

  it("TC-ALERT-003: should resolve and remove notifications upon successful triage", () => {
    const store = useNotificationStore.getState();
    const targetId = 999;
    store.removeNotificationByIdAndType(targetId, "emergency");

    const stateAfter = useNotificationStore.getState();
    expect(stateAfter.emergencyDatas.some((n) => n.notification_id === targetId)).toBe(false);
  });
});
