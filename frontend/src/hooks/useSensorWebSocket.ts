import { Bed } from "../types/bed";
import { SensorIdList } from "../types/sensor";
import { buildWsUrl } from "./ws";
import { MOCK_BEDS } from "../services/mockData";

export function sensorWebsocket(
  sensor_id_list: SensorIdList,
  setFilteredBeds: React.Dispatch<React.SetStateAction<Bed[]>>,
  setBackupFilteredBedsSearch: React.Dispatch<React.SetStateAction<Bed[]>>,
  search: string
) {
  let ws: WebSocket | null = null;
  let intervalId: any = null;

  // Initialize with mock beds immediately
  const initialFiltered = MOCK_BEDS.filter(
    (bed) =>
      bed.bed_activated &&
      (!search ||
        (bed.patient?.patient_name?.toLowerCase() || "").includes(
          search.toLowerCase()
        ))
  );
  setFilteredBeds(initialFiltered);
  setBackupFilteredBedsSearch(MOCK_BEDS);

  // Live real-time vital signs pulse simulation (Heart Rate, SpO2, Respiration)
  intervalId = setInterval(() => {
    setFilteredBeds((prev) =>
      prev.map((bed) => ({
        ...bed,
        sensors: bed.sensors.map((sensor) => {
          if (sensor.sensor_type === "heart_rate") {
            const hr = 72 + Math.floor(Math.random() * 8);
            const history = [...sensor.history_value_sensor];
            if (history.length > 0) {
              history[history.length - 1] = {
                ...history[history.length - 1],
                sensor_value: String(hr),
                timestamp: new Date().toISOString(),
              };
            }
            return {
              ...sensor,
              history_value_sensor: history,
            };
          }
          if (sensor.sensor_type === "spo2") {
            const spo2 = 98 + (Math.random() > 0.5 ? 1 : 0);
            const history = [...sensor.history_value_sensor];
            if (history.length > 0) {
              history[history.length - 1] = {
                ...history[history.length - 1],
                sensor_value: String(spo2),
                timestamp: new Date().toISOString(),
              };
            }
            return {
              ...sensor,
              history_value_sensor: history,
            };
          }
          return sensor;
        }),
      }))
    );
  }, 2500);

  try {
    ws = new WebSocket(buildWsUrl("/sensors/ws/sensors_value"));
    ws.onopen = () => {
      ws?.send(JSON.stringify(sensor_id_list));
    };

    ws.onmessage = (event) => {
      try {
        const jsonData = JSON.parse(event.data);
        const filtered = jsonData.filter(
          (bed: Bed) =>
            bed.bed_activated &&
            (!search ||
              (bed.patient?.patient_name?.toLowerCase() || "").includes(
                search.toLowerCase()
              ))
        );
        setFilteredBeds(filtered);
        setBackupFilteredBedsSearch(filtered);
      } catch (err) {
        console.error("[WebSocket] Failed to parse data:", err);
      }
    };

    ws.onerror = () => {
      // Keep simulation running silently
    };
  } catch {
    // Keep simulation running
  }

  return {
    close: () => {
      if (intervalId) clearInterval(intervalId);
      if (ws) ws.close();
    },
  };
}
