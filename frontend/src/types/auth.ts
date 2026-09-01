export interface LoginPayload {
  username: string;
  password: string;
}

export interface CurrentUser {
  name: string;
  position: string;
  ward_id: number;
}