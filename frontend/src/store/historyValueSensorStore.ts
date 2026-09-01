import { create } from "zustand";
import { History_Value_Sensor } from "../types/history_value_sensor";
import { historyValueSensorService } from "../services/historyValueSensorService";

interface historyValueSensorStore {
  historySensor: History_Value_Sensor[];
  load1DayHistoryValue: (
    sensor_id: number,
    date_str: string
  ) => Promise<History_Value_Sensor[]>;
}

export const usehistoryValueSensorStore = create<historyValueSensorStore>(
  () => ({
    historySensor: [],

    load1DayHistoryValue: async (sensor_id: number, date_str: string) => {
      try {
        console.log("picking history value sensor for:", sensor_id, date_str);
        const res = await historyValueSensorService.load1DayHistoryValue(
          sensor_id,
          date_str
        );
        console.log("✅ API Response History Value Sensor:", res);

        const historyData = Array.isArray(res) ? res : res ? [res] : []; // ✅ ป้องกัน res เป็น undefined หรือ object เดียว
        return historyData; // ✅ คืนค่าเป็น History_Value_Sensor[]
      } catch (error) {
        console.error("❌ โหลดข้อมูลค่าประวัติเซ็นเซอร์ล้มเหลว:", error);
        return []; // ✅ คืนค่าเป็น array ว่างถ้าเกิดข้อผิดพลาด
      }
    },
  })
);
