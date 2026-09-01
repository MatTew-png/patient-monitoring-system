import { create } from "zustand";
// import { notificationService } from "../services/notificationService";
import { Notification } from "../types/notification";
import { Log_bed_patient_sensor } from "../types/log_bed_patient_sensor";
import { notificationService } from "../services/notificationService";
// import { sensorNotificationsConfigService } from "../services/sensorNotificationsConfigService";
import { notificationWebSocketService } from "../hooks/notification.websocket";
import { sortByStatusAndDate, sortNotificationByDate } from "../utils/sort";

interface NotificationStore {
  // NotificationByPatientAndSensor: Notification[];
  showAlert: boolean;
  selectedAlertType: string;
  LogHistoryNotifications: Log_bed_patient_sensor | null;
  notifications: Notification[];
  setSelectedAlertType: (type: string) => void;
  setShowAlert: (value: boolean) => void;
  acceptEmergencyByNotification: (notification_id: number) => Promise<void>;
  successEmergencyByNotification: (notification_id: number) => void;
  acceptSos: (notification_id: number) => void;
  successSos: (notification_id: number) => void;
  // loadLogHistoryNotifications: (
  //   bed_id: number,
  //   patient_id: number,
  //   sensor_id: number
  // ) => Promise<void>;
  loadEmergencyNotAccepted: () => Promise<void>;
  loadEmergencyNotSuccessed: () => Promise<void>;
  emergencyDatas: Notification[];
  emergencyDataWithAccepted: Notification[];
  loadSosNotAccepted: () => Promise<void>;
  loadSosNotSuccessed: () => Promise<void>;
  sosDatas: Notification[];
  sosDataWithAccepted: Notification[];
  getNotificationsByDate: (
    start_date: string,
    end_date: string
  ) => Promise<Notification[]>;
  getNotificationsByPatientAndSensor: (
    patient_id: number,
    sensor_id: number
  ) => Promise<Notification[]>;
  removeNotificationByIdAndType: (
    notification_id: number,
    type: "sos" | "emergency"
  ) => void;
  sortByStatusAndDate: (notifications: Notification[]) => Notification[];
  moveToAccepted: (notification_id: number, type: "sos" | "emergency") => void;
}

import { MOCK_NOTIFICATIONS } from "../services/mockData";

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  LogHistoryNotifications: {},
  emergencyDatas: [MOCK_NOTIFICATIONS[0]],
  emergencyDataWithAccepted: [],
  sosDatas: [MOCK_NOTIFICATIONS[1]],
  sosDataWithAccepted: [],
  notifications: MOCK_NOTIFICATIONS,
  showAlert: false,
  selectedAlertType: "",
  setSelectedAlertType: (type) => set({ selectedAlertType: type }),

  setShowAlert: (value) => set({ showAlert: value }),

  // WebSocket
  loadEmergencyNotAccepted: async () => {
    notificationWebSocketService.connect("emergency/pending", (data) => {
      const current = get().emergencyDatas;
      const exists = current.some(
        (item) => item.notification_id === data.notification_id
      );
      if (!exists) {
        set({
          emergencyDatas: sortNotificationByDate([...current, data]),
        });
      }
    });
  },
  loadEmergencyNotSuccessed: async () => {
    notificationWebSocketService.connect("emergency/accepted", (data) => {
      const current = get().emergencyDataWithAccepted;
      const exists = current.some(
        (item) => item.notification_id === data.notification_id
      );
      if (!exists) {
        set({
          emergencyDataWithAccepted: sortNotificationByDate([...current, data]),
        });
      }
    });
  },
  loadSosNotAccepted: async () => {
    notificationWebSocketService.connect("sos/pending", (data) => {
      const current = get().sosDatas;
      const exists = current.some(
        (item) => item.notification_id === data.notification_id
      );
      if (!exists) {
        set({
          sosDatas: sortByStatusAndDate([...current, data]),
        });
      }
    });
  },
  loadSosNotSuccessed: async () => {
    notificationWebSocketService.connect("sos/accepted", (data) => {
      const current = get().sosDataWithAccepted;
      const exists = current.some(
        (item) => item.notification_id === data.notification_id
      );
      if (!exists) {
        set({
          sosDataWithAccepted: sortByStatusAndDate([...current, data]),
        });
      }
    });
  },

  // REST API
  acceptEmergencyByNotification: async (notification_id: number) => {
    notificationService.acceptEmergencyByNotification(notification_id);
  },

  successEmergencyByNotification: (notification_id: number) => {
    notificationService.successEmergencyByNotification(notification_id);
    get().removeNotificationByIdAndType(notification_id, "emergency");
  },
  acceptSos: async (notification_id: number) => {
    notificationService.acceptSosByNotification(notification_id);
  },
  successSos: async (notification_id: number) => {
    notificationService.successSos(notification_id);
    get().removeNotificationByIdAndType(notification_id, "sos");
  },

  // Other methods
  getNotificationsByDate: async (start_date: string, end_date: string) => {
    const data = notificationService.getNotificationsByDate(
      start_date,
      end_date
    );
    return data;
  },
  getNotificationsByPatientAndSensor: async (
    patient_id: number,
    sensor_id: number
  ) => {
    const data = notificationService.getNotificationsByPatientAndSensor(
      patient_id,
      sensor_id
    );
    return data;
  },
  removeNotificationByIdAndType: (
    notification_id: number,
    type: "sos" | "emergency"
  ) => {
    set((state) => {
      if (type === "sos") {
        return {
          sosDatas: state.sosDatas.filter(
            (n) => n.notification_id !== notification_id
          ),
          sosDataWithAccepted: state.sosDataWithAccepted.filter(
            (n) => n.notification_id !== notification_id
          ),
        };
      } else if (type === "emergency") {
        return {
          emergencyDatas: state.emergencyDatas.filter(
            (n) => n.notification_id !== notification_id
          ),
          emergencyDataWithAccepted: state.emergencyDataWithAccepted.filter(
            (n) => n.notification_id !== notification_id
          ),
        };
      }
      return {};
    });
  },
  sortByStatusAndDate: (notifications: Notification[]) => {
    return [...notifications].sort((a, b) => {
      // 1) Pending อยู่บน
      if (!a.notification_accepted && b.notification_accepted) return -1;
      if (a.notification_accepted && !b.notification_accepted) return 1;

      // 2) ถ้าสถานะเดียวกัน → เรียงจากวันที่ล่าสุด
      return (
        new Date(b.notification_updatedate ?? 0).getTime() -
        new Date(a.notification_updatedate ?? 0).getTime()
      );
    });
  },
  moveToAccepted: (notification_id: number, type: "sos" | "emergency") => {
    set((state) => {
      const fromList = type === "sos" ? state.sosDatas : state.emergencyDatas;
      const toList =
        type === "sos"
          ? state.sosDataWithAccepted
          : state.emergencyDataWithAccepted;

      const target = fromList.find(
        (n) => n.notification_id === notification_id
      );
      if (!target) return {};

      target.notification_accepted = true;
      const newFromList = fromList.filter(
        (n) => n.notification_id !== notification_id
      );
      const newToList = [...toList, target]; // ใส่ท้ายสุด

      if (type === "sos") {
        return { sosDatas: newFromList, sosDataWithAccepted: newToList };
      } else {
        return {
          emergencyDatas: newFromList,
          emergencyDataWithAccepted: newToList,
        };
      }
    });
  },
}));
// loadAllNotificationByPatient: async (patient_id: number, sensor_id: number) => {
//   set({NotificationByPatientAndSensor:[]})
//     const res = await notificationService.loadAllNotificationByPatient(patient_id, sensor_id);
//     console.log("✅ API Response NotificationByPatient :", res);
//     if (res) {
//       set({ NotificationByPatientAndSensor: Array.isArray(res) ? res : [res] }); // ✅ ป้องกัน error
//     } // ✅ ถ้า res เป็น undefined → เปลี่ยนเป็น null
// loadLogHistoryNotifications: async (
//   bed_id: number,
//   patient_id: number,
//   sensor_id: number
// ) => {
//   console.log(bed_id);
//   console.log(patient_id);
//   console.log(sensor_id);
//   const res = await sensorNotificationsConfigService.fetchNotification(
//     bed_id,
//     patient_id,
//     sensor_id
//   );
//   console.log("✅ API Response Log History Notifications:", res);
//   set({ LogHistoryNotifications: res ?? null });
// },
