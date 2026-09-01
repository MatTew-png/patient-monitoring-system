import http from "./http";
import { User } from "../types/user";
import { MOCK_USERS } from "./mockData";

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      const res = await http.get("/users");
      return res.data?.length ? res.data : MOCK_USERS;
    } catch {
      return MOCK_USERS;
    }
  },
  async getUser(userId: number): Promise<User> {
    try {
      const res = await http.get(`/users/${userId}`);
      return res.data || MOCK_USERS.find((u) => u.user_id === Number(userId)) || MOCK_USERS[0];
    } catch {
      return MOCK_USERS.find((u) => u.user_id === Number(userId)) || MOCK_USERS[0];
    }
  },

  async addUser(user: Omit<User, "user_id">) {
    try {
      const res = await http.post("/users", user);
      return res.data;
    } catch {
      return { user_id: 4, ...user };
    }
  },

  async editUser(userId: number, user: Partial<User>) {
    try {
      const res = await http.patch(`/users/edit/${userId}`, user);
      return res.data;
    } catch {
      return { user_id: userId, ...user };
    }
  },

  async deleteUser(user_id: number) {
    try {
      const res = await http.delete(`users/${user_id}`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  async addImageToUser(formData: FormData, user_id: number) {
    try {
      const res = await http.post(`/users/${user_id}/upload-image`, formData);
      return res.data;
    } catch {
      return { success: true };
    }
  },
};
