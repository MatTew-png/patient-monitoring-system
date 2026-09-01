import { create } from "zustand";
import { userService } from "../services/userService";
import { User } from "../types/user";

interface UserStore {
  users: User[];
  getUsers: () => Promise<void>;
  addUser: (user: Omit<User, "user_id">) => Promise<User>;
  editUser: (userId: number, user: Partial<User>) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  getUser: (userId: number) => Promise<User>;
  addUserImage: (userId: number, image: File) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],

  getUsers: async () => {
    try {
      const data = await userService.getUsers();
      set({ users: data });
    } catch (err) {
      console.error("❌ getUsers failed:", err);
    }
  },

  addUser: async (user) => {
    try {
      const newUser = await userService.addUser(user);
      await get().getUsers();
      return newUser;
    } catch (err) {
      console.error("❌ addUser failed:", err);
      throw err;
    }
  },

  editUser: async (userId, user) => {
    try {
      await userService.editUser(userId, user);
      await get().getUsers();
    } catch (err) {
      console.error("❌ editUser failed:", err);
    }
  },

  deleteUser: async (user_id) => {
    try {
      await userService.deleteUser(user_id);
      await get().getUsers();
    } catch (err) {
      console.error("❌ deleteUser failed:", err);
    }
  },
  getUser: async (user_id:number) => {
      const res = await userService.getUser(user_id);
      return res as User
  },

  addUserImage: async (userId: number, image: File) => {
    try {
      const formData = new FormData();
      formData.append("file", image);

      console.log("📤 Uploading image for user:", userId);

      const imagePath = await userService.addImageToUser(formData, userId);

      console.log("✅ Uploaded image path:", imagePath);

      await get().getUsers(); // ดึงข้อมูลใหม่
    } catch (err) {
      console.error("❌ addUserImage failed:", err);
    }
  },
}));
