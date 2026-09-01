import http from "./http";
import { AxiosError } from "axios"; // ✅ นำเข้า AxiosError (ถ้าใช้ axios)
import { History_Value_Sensor } from "../types/history_value_sensor";

export const historyValueSensorService = {
  async load1DayHistoryValue(
    sensor_id: number,
    date_str: string
  ): Promise<History_Value_Sensor | null> {
    try {
      const response = await http.get(
        `history_value_sensors/history-value-sensor-date/${sensor_id}/${date_str}`
      );
      return response.data; // ✅ คืนค่าข้อมูลที่ได้จาก API
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        // ✅ เช็กว่าเป็น AxiosError หรือไม่
        if (error.response?.status === 404) {
          console.warn(
            `History value sensor not found for sensor_id: ${sensor_id} and date_str: ${date_str}`
          );
          return null; // ✅ คืน `null` ถ้า API ส่ง 404
        }
      } else if (error instanceof Error) {
        // ✅ เช็กว่าเป็น JavaScript Error ปกติ
        console.error("Error loading history value sensor:", error.message);
      } else {
        console.error("Unexpected error:", error); // ❌ ถ้าไม่ใช่ Error ปกติ ให้แสดงค่า error ทั้งหมด
      }
      throw error; // ❗ โยน error ออกไปให้ caller handle ต่อ
    }
  },
};
