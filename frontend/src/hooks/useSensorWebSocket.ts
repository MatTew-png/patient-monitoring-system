import { Bed } from "../types/bed";
import { SensorIdList } from "../types/sensor";
import { buildWsUrl } from "./ws";

// const FIXED_SENSOR_ID_LIST: SensorIdList = {
//   sensors_id: [29, 30, 31, 32, 33, 34, 35],
// };

export function sensorWebsocket(
  sensor_id_list: SensorIdList,
  setFilteredBeds: React.Dispatch<React.SetStateAction<Bed[]>>,
  setBackupFilteredBedsSearch: React.Dispatch<React.SetStateAction<Bed[]>>,
  search: string
) {
  const ws = new WebSocket(buildWsUrl("/sensors/ws/sensors_value"));
  ws.onopen = () => {
    // console.log("[WebSocket] Connected");
    ws.send(JSON.stringify(sensor_id_list));
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
      // console.log(filtered);
      setFilteredBeds(filtered);
      setBackupFilteredBedsSearch(filtered);
      // console.log(filtered);
    } catch (err) {
      console.error("[WebSocket] Failed to parse data:", err);
    }
  };

  ws.onerror = (err) => {
    console.error("[WebSocket] Error:", err);
  };

  ws.onclose = () => {
    // console.log("[WebSocket] Disconnected");
  };

  return ws; // เพื่อให้คุณสามารถปิดมันได้ตอน unmount
}
