import { Floor } from "./floor";
import { Ward } from "./ward";

export interface Room {
  room_id?: number;
  room_name: string;
  floor?: Floor;
  floor_id?: number;
  ward?: Ward;
  ward_id?: number | null;
  room_count?: number; // เพิ่ม field room_count เพื่อรองรับการเพิ่มหลายห้อง
}
