import { Bed } from "./bed";
// import { Building } from "./building";
import { Notification } from "./notification";
import { Patient } from "./patient";
import { Sensor } from "./sensor";

export interface Log_bed_patient_sensor {
  log_bed_patient_sensor_id?: number;
  bed_id?: number;
  patient_id?: number;
  sensor_id?: number;
  log_bed_patient_sensor_date?: string;
  notifications?: Notification[];
  bed?: Bed;
  patient?: Patient;
  sensor?: Sensor;
  // building?: Building;
}
