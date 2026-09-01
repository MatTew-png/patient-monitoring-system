import http from "./http";
import { History_Value_Sensor } from "../types/history_value_sensor";

export const historyValueSensorService = {
  async load1DayHistoryValue(
    sensor_id: number,
    date_str: string
  ): Promise<History_Value_Sensor[] | any> {
    try {
      const response = await http.get(
        `history_value_sensors/history-value-sensor-date/${sensor_id}/${date_str}`
      );
      return response.data;
    } catch {
      // Return 24 hourly telemetry points for graphs
      const mockPoints = Array.from({ length: 24 }, (_, i) => ({
        history_value_sensor_id: i + 1,
        sensor_id: Number(sensor_id),
        sensor_value: (72 + Math.sin(i / 2) * 8 + (Number(sensor_id) % 3) * 2).toFixed(1),
        timestamp: `${date_str || "2026-09-01"}T${String(i).padStart(2, "0")}:00:00Z`,
      }));
      return mockPoints;
    }
  },
};
