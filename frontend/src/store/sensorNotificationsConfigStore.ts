import { create } from "zustand";
import { Sensor_Notification_Config } from "../types/sensor_Notifications_config";
import { sensorNotificationsConfigService } from "../services/sensorNotificationsConfigService";
import { Bed } from "../types/bed";
import { Log_bed_patient_sensor } from "../types/log_bed_patient_sensor";
import { Sensor } from "../types/sensor";

interface sensorNotificationsConfigStore {
  sensorNotiConfigs: Sensor_Notification_Config[];
  loadSensorNotificationConfig: (bed_id: number) => Promise<void>;
  saveSensorNotificationConfig: (
    sensor_id: number,
    sensor: Sensor
  ) => Promise<void>;
  loadBedWithSensorConfig: (bed_id: number) => Promise<Bed>;

  logAllNotifications: Log_bed_patient_sensor[];
  loadLogNotifications: (bed_id: number, patient_id: number) => Promise<void>;
  targetLogHistory: Log_bed_patient_sensor;
  targetLog: (
    bed_id: number,
    patient_id: number,
    sensor_id: number
  ) => Promise<void>;
}

export const useSensorNotificationsConfigStore =
  create<sensorNotificationsConfigStore>((set, get) => ({
    sensorNotiConfigs: [],
    logAllNotifications: [],
    targetLogHistory: {},
    loadSensorNotificationConfig: async (bed_id: number) => {
      set({ sensorNotiConfigs: [] });
      const res =
        await sensorNotificationsConfigService.loadSensorNotificationConfig(
          bed_id
        );
      console.log("res data ตรงนี้ ที่ store", res); // ✅ ป้องกัน error
      if (res) {
        set({ sensorNotiConfigs: Array.isArray(res) ? res : [res] }); // ✅ ป้องกัน error
      }
    },
    saveSensorNotificationConfig: async (sensor_id: number, sensor: Sensor) => {
      sensorNotificationsConfigService.saveSensorNotificationConfig(
        sensor_id,
        sensor
      );
    },

    loadBedWithSensorConfig: async (bed_id: number) => {
      const res =
        await sensorNotificationsConfigService.loadBedWithSensorConfig(bed_id);
      return res;
    },

    loadLogNotifications: async (bed_id: number, patient_id: number) => {
      set({ logAllNotifications: [] });
      const res = await sensorNotificationsConfigService.loadLogNotifications(
        bed_id,
        patient_id
      );
      set({ logAllNotifications: res });
    },

    targetLog: async (
      bed_id: number,
      patient_id: number,
      sensor_id: number
    ) => {
      // รอให้ logAllNotifications มีข้อมูลก่อน
      const waitForData = () =>
        new Promise<void>((resolve) => {
          const checkData = () => {
            if (get().logAllNotifications.length > 0) {
              resolve();
            } else {
              setTimeout(checkData, 100); // เช็คซ้ำทุก 100ms
            }
          };
          checkData();
        });

      await waitForData(); // รอข้อมูลก่อนทำงาน

      const { logAllNotifications } = get();

      console.log(bed_id, patient_id, sensor_id);

      const res = logAllNotifications.filter(
        (notification) =>
          notification.bed_id === bed_id &&
          notification.patient_id === patient_id &&
          notification.sensor_id === sensor_id
      );

      set({ targetLogHistory: res[0] ?? null });
    },
  }));
