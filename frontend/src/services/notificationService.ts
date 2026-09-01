import http from "./http";
import { Notification } from "../types/notification";
import { MOCK_NOTIFICATIONS } from "./mockData";

export const notificationService = {
  async loadAllNotificationByPatient(
    patient_id: number,
    sensor_id: number
  ): Promise<Notification[]> {
    try {
      const response = await http.get(
        `notifications/patient/${patient_id}/sensor/${sensor_id}`
      );
      return response.data?.length ? response.data : MOCK_NOTIFICATIONS;
    } catch {
      return MOCK_NOTIFICATIONS;
    }
  },

  async loadEmergencyNotAccepted(): Promise<Notification[]> {
    try {
      const response = await http.get(
        `notifications/notifications_not_accepted/emergency`
      );
      return response.data?.length ? response.data : [MOCK_NOTIFICATIONS[0]];
    } catch {
      return [MOCK_NOTIFICATIONS[0]];
    }
  },

  async loadEmergencyNotSuccessed(): Promise<Notification[]> {
    try {
      const response = await http.get(
        `notifications/notifications_not_successed/emergency`
      );
      return response.data?.length ? response.data : [MOCK_NOTIFICATIONS[0]];
    } catch {
      return [MOCK_NOTIFICATIONS[0]];
    }
  },

  async acceptEmergencyByNotification(
    notification_id: number
  ): Promise<Notification> {
    try {
      const response = await http.patch(
        `notifications/notifications_accepted_emer/${notification_id}`
      );
      return response.data;
    } catch {
      return { ...MOCK_NOTIFICATIONS[0], notification_accepted: true };
    }
  },

  async successEmergencyByNotification(
    notification_id: number
  ): Promise<Notification> {
    try {
      const response = await http.patch(
        `notifications/notifications_success_emer/${notification_id}`
      );
      return response.data;
    } catch {
      return { ...MOCK_NOTIFICATIONS[0], notification_successed: true };
    }
  },

  async loadSosNotAccepted(): Promise<Notification[]> {
    try {
      const response = await http.get(
        `notifications/notifications_not_accepted/sos`
      );
      return response.data?.length ? response.data : [MOCK_NOTIFICATIONS[1]];
    } catch {
      return [MOCK_NOTIFICATIONS[1]];
    }
  },

  async loadSosNotSuccessed(): Promise<Notification[]> {
    try {
      const response = await http.get(
        `notifications/notifications_not_successed/sos`
      );
      return response.data?.length ? response.data : [MOCK_NOTIFICATIONS[1]];
    } catch {
      return [MOCK_NOTIFICATIONS[1]];
    }
  },

  async acceptSosByNotification(
    notification_id: number
  ): Promise<Notification> {
    try {
      const response = await http.patch(
        `notifications/notifications_accepted_sos/${notification_id}`
      );
      return response.data;
    } catch {
      return { ...MOCK_NOTIFICATIONS[1], notification_accepted: true };
    }
  },

  async successSos(notification_id: number): Promise<Notification> {
    try {
      const response = await http.patch(
        `notifications/notifications_success_sos/${notification_id}`
      );
      return response.data;
    } catch {
      return { ...MOCK_NOTIFICATIONS[1], notification_successed: true };
    }
  },

  async getNotificationsByDate(
    start_date: string,
    end_date: string
  ): Promise<Notification[]> {
    try {
      const res = await http.get(
        `notifications/by_date_range/?start_date=${start_date}&end_date=${end_date}`
      );
      return res.data?.length ? res.data : MOCK_NOTIFICATIONS;
    } catch {
      return MOCK_NOTIFICATIONS;
    }
  },

  async getNotificationsByPatientAndSensor(
    patient_id: number,
    sensor_id: number
  ): Promise<Notification[]> {
    try {
      const res = await http.get(
        `/notifications/patient/${patient_id}/sensor/${sensor_id}`
      );
      return res.data?.length ? res.data : MOCK_NOTIFICATIONS;
    } catch {
      return MOCK_NOTIFICATIONS;
    }
  },
};
