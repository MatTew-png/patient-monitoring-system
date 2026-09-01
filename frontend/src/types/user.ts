import { Ward } from "./ward";

export interface User {
  user_id: number;
  user_name: string;
  user_position: string;
  user_username: string;
  user_password: string;
  image_path?: string;
  ward?: Ward;
  ward_id?: number;
}
