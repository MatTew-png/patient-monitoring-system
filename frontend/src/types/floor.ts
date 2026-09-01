import { Building } from "./building";
import { Room } from "./room";

export interface Floor {
  floor_id?: number;
  floor_name: string;
  building: Building;
  room?: Room[];
}
