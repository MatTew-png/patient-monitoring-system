import { Log_bed_patient_sensor } from "./log_bed_patient_sensor";
import { Sensor_Notification_Config } from "./sensor_Notifications_config";

export interface Notification {
  sensor_notifications_config_id: number;
  log_bed_patient_sensor_id: number;
  notification_id: number;
  notification_successed: boolean;
  notification_category: string;
  notification_accepted: boolean;
  notification_createdate?: string;
  notification_updatedate?: string;
  sensor_notifications_config: Sensor_Notification_Config;
  log_bed_patient_sensor?: Log_bed_patient_sensor;
}
