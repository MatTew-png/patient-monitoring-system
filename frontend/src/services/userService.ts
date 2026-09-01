import http from "./http";
import { User } from "../types/user";

export const userService = {
  async getUsers(): Promise<User[]> {
    const res = await http.get("/users");
    return res.data;
  },
  async getUser(userId: number): Promise<User> {
    const res = await http.get(`/users/${userId}`);
    return res.data;
  },

  async addUser(user: Omit<User, "user_id">) {
    const res = await http.post("/users", user);
    return res.data;
  },

  async editUser(userId: number, user: Partial<User>) {
    const res = await http.patch(`/users/edit/${userId}`, user);
    return res.data;
  },

  async deleteUser(user_id: number) {
    const res = await http.delete(`users/${user_id}`);
    return res.data;
  },

  async addImageToUser(formData: FormData, user_id: number) {
    const res = await http.post(`/users/${user_id}/upload-image`, formData);
    return res.data;
  },
};
