import { Sensor, SensorIdList } from "../types/sensor";
import http from "./http";
import { createMockSensors } from "./mockData";

const MOCK_SENSORS_ALL = [
  ...createMockSensors(1),
  ...createMockSensors(2),
  ...createMockSensors(3),
];

export const sensorService = {
  async loadValueSensor(sensor_id: number): Promise<Sensor> {
    try {
      const response = await http.get(`sensors/getValueSensor/${sensor_id}`);
      return response.data;
    } catch {
      return MOCK_SENSORS_ALL.find((s) => s.sensor_id === Number(sensor_id)) || MOCK_SENSORS_ALL[0];
    }
  },

  async loadAllSensorFree(): Promise<Sensor[]> {
    try {
      const response = await http.get("/sensors/sensorFree/all");
      return response.data?.length ? response.data : MOCK_SENSORS_ALL;
    } catch {
      return MOCK_SENSORS_ALL;
    }
  },

  async saveSensorConfig(sensor_id: number, sensor: Sensor): Promise<Sensor[]> {
    try {
      const response = await http.patch(
        `sensors/update_sensor/${sensor_id}`,
        sensor
      );
      return response.data;
    } catch {
      return MOCK_SENSORS_ALL;
    }
  },

  async getSensors() {
    try {
      const res = await http.get("/sensors");
      return res.data?.length ? res : { data: MOCK_SENSORS_ALL };
    } catch {
      return { data: MOCK_SENSORS_ALL };
    }
  },

  async addSensor(sensor: Sensor) {
    try {
      const res = await http.post("/sensors", sensor);
      return res;
    } catch {
      return { data: sensor };
    }
  },

  async deleteSensor(sensor_id: number) {
    try {
      await http.delete(`/sensors/${sensor_id}`);
    } catch {
      return { success: true };
    }
  },

  async editSensor(sensor_id: number, sensor: Sensor) {
    try {
      const res = await http.patch(`/sensors/edit/${sensor_id}`, sensor);
      return res;
    } catch {
      return { data: sensor };
    }
  },

  async getValueSensorOneTime(sensors_id_list: SensorIdList) {
    try {
      const res = await http.post(
        `/sensors/restapi/sensors_value`,
        sensors_id_list
      );
      return res;
    } catch {
      return { data: MOCK_SENSORS_ALL };
    }
  },
};
