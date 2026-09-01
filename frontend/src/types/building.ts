import { Floor } from "./floor";

export interface Building {
  building_id?: number;
  building_name: string;
  floor?: Floor[];
}
