import { Sensor, SensorIdList } from "../types/sensor";
import http from "./http";

export const sensorService = {
  async loadValueSensor(sensor_id: number): Promise<Sensor> {
    const response = await http.get(`sensors/getValueSensor/${sensor_id}`);
    return response.data; // นำข้อมูลที่ได้จาก response มาใช้
  },

  async loadAllSensorFree(): Promise<Sensor[]> {
    try {
      const response = await http.get("/sensors/sensorFree/all");
      return response.data; // นำข้อมูลที่ได้จาก response มาใช้
    } catch (error) {
      console.error("Error loading all sensors:", error);
      throw error; // หากเกิดข้อผิดพลาดให้โยนข้อผิดพลาดออกไป
    }
  },
  async saveSensorConfig(sensor_id: number, sensor: Sensor): Promise<Sensor[]> {
    try {
      const response = await http.patch(
        `sensors/update_sensor/${sensor_id}`,
        sensor
      );
      return response.data; // นำข้อมูลที่ได้จาก response มาใช้
    } catch (error) {
      console.error("Error loading all sensors:", error);
      throw error; // หากเกิดข้อผิดพลาดให้โยนข้อผิดพลาดออกไป
    }
  },
  async getSensors() {
    const res = await http.get("/sensors");
    return res;
  },
  async addSensor(sensor: Sensor) {
    const res = await http.post("/sensors", sensor);
    return res;
  },
  async deleteSensor(sensor_id: number) {
    await http.delete(`/sensors/${sensor_id}`);
  },

  async editSensor(sensor_id: number, sensor: Sensor) {
    const res = await http.patch(`/sensors/edit/${sensor_id}`, sensor);
    return res;
  },
  async getValueSensorOneTime(sensors_id_list: SensorIdList) {
    const res = await http.post(
      `/sensors/restapi/sensors_value`,
      sensors_id_list
    );
    return res;
  },
};
