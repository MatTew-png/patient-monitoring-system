import { Patient } from "./patient";
import { Room } from "./room";
import { Sensor } from "./sensor";

export interface Bed {
  bed_id: number;
  bed_name: string;
  bed_activated: boolean;
  room: Room;
  patient?: Patient;
  room_id?:number
  patient_id?: number;
  sensors: Sensor[];
  selectedShowSensorId?: number[] | null;
}

export interface AddBed {
  bed_name: string;
  room_id?: number;
  bed_activated: boolean;
}
export interface BedSaveConfig {
  bed_id: number;
  patient_id: number | null;
  sensors: { sensor_id: number; bed_id: number }[];
}
