import { create } from "zustand";
import { wardService } from "../services/wardService";
import { AddWard, Ward } from "../types/ward";

interface WardStore {
  wards: Ward[];
  getWards: () => Promise<Ward[]>;
  getWardById: (ward_id: number) => Promise<Ward | null>; // 👈 เพิ่ม
  addWard: (addWard: AddWard) => Promise<void>;
  deleteWard: (ward_id: number) => Promise<void>;
  updateWard: (ward_id: number, update: AddWard) => Promise<void>;
}

export const useWardStore = create<WardStore>((set) => ({
  wards: [],

  getWards: async () => {
    try {
      const data = await wardService.getWards();
      set({ wards: data });
      return data;
    } catch (err) {
      console.error("Failed to fetch wards:", err);
      return [];
    }
  },

  getWardById: async (ward_id: number) => {
    try {
      const data = await wardService.getWard(ward_id);
      return data;
    } catch (err) {
      console.error("Failed to fetch ward:", err);
      return null;
    }
  },

  addWard: async (addWard: AddWard) => {
    await wardService.addWard(addWard);
  },
  updateWard: async (ward_id: number, update: AddWard) => {
    await wardService.updateWard(ward_id, update);
    set((state) => ({
      wards: state.wards.map((w) =>
        w.ward_id === ward_id ? { ...w, ...update } : w
      ),
    }));
  },
  deleteWard: async (ward_id: number) => {
    await wardService.deleteWard(ward_id);
    set((state) => ({
      wards: state.wards.filter((ward) => ward.ward_id !== ward_id),
    }));
  },
}));
