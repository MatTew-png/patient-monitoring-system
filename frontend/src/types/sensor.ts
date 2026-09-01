import { Bed } from "./bed";
import { History_Value_Sensor } from "./history_value_sensor";
import { Sensor_Notification_Config } from "./sensor_Notifications_config";

export interface Sensor {
  bed_id?: number | null;
  sensor_id: number;
  sensor_type: string;
  sensor_status: boolean;
  sensor_mac_i?: string;
  sensor_mac_ii?: string;
  history_value_sensor: History_Value_Sensor[];
  sensor_unit?: string;
  sensor_name?: string;
  sensor_notifications_config?: Sensor_Notification_Config[];
  bed?: Bed;
}

export interface SensorIdList {
  sensors_id: number[];
}
