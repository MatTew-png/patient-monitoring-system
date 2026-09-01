import { Room } from "./room";

export interface Ward {
  ward_id?: number;
  ward_name: string;
  room?: Room[];
}

export interface AddWard {
  ward_name: string;
  room_id?: number[];
}
