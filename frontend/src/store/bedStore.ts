import { create } from "zustand";
import { AddBed, Bed, BedSaveConfig } from "../types/bed";
import { bedService } from "../services/bedService";
import { Building } from "../types/building";

interface BedStore {
  loading: boolean;
  beds: Bed[];
  error: string | null;
  loadBeds: () => Promise<Bed[] | undefined>;
  loadBedsByPage: (page: number) => Promise<Bed[] | undefined>;
  getBedsFreeByWard: () => Promise<Bed[]>;
  saveSelectedShowSensorId: (bed_id: number, sensor_id: number) => Promise<void>;
  saveRemoveShowSensorId: (bed_id: number, sensor_id: number) => Promise<void>;
  saveBedConfig: (bed_id: number, bed: BedSaveConfig) => Promise<void>;
  saveUpdatedBedConfig: (bed_id: number, bed: Bed) => Promise<void>;
  getLocations: () => Promise<Building[]>;
  getBedsFree: () => Promise<Bed[]>;
  getBed: (bed_id: number) => Promise<Bed>;
  getBeds: () => Promise<Bed[]>;
  deleteBed: (bed_id: number) => Promise<void>;
  countBed: () => Promise<number>;
  addBed: (bed: AddBed) => Promise<void>;
  editBed: (bed_id: number, bed: Bed) => Promise<void>;
  currentPage: number;
  setCurrentPage: (page: number) => void;

}

export const useBedStore = create<BedStore>((set) => ({
  beds: [],
  loading: false,
  error: null,
  currentPage: 1, // ✅ ตั้งค่าตั้งต้น
  setCurrentPage: (page: number) => set({ currentPage: page }),


  loadBeds: async () => {
    set({ loading: true, error: null });
    try {
      const response = await bedService.loadBedActivatedAll();
      set({ beds: response, loading: false });
      return response;
    } catch (error) {
      console.error(error);
      set({ error: "Failed to fetch beds", loading: false });
    }
  },
  countBed: async (): Promise<number> => {
    try {
      const response = await bedService.countBedActivatedAll();
      return response ?? 0; 
    } catch (error) {
      console.error(error);
      set({ error: "Failed to fetch countbeds" });
      return 0; 
    }
  },

  getBedsFreeByWard: async () => {
    set({ loading: true, error: null });
    try {
      const response = await bedService.getBedsFreeByWard();
      return response ?? [];
    } catch (error) {
      console.error(error);
      set({ error: "Failed to fetch beds free by ward", loading: false });
      return [];
    }
  },

  loadBedsByPage: async (page: number) => {
    set({ loading: true, error: null });
    try {
      const response = await bedService.loadBedsByPage(page, 6);
      set({ beds: response, loading: false });
      return response;
    } catch (error) {
      console.error(error);
      set({ error: "Failed to fetch beds by page", loading: false });
    }
  },
  saveSelectedShowSensorId: async (bed_id: number, sensor_id: number) => {
    await bedService.saveSelectedShowSensorId(bed_id, sensor_id);
  },

  saveRemoveShowSensorId: async (bed_id: number, sensor_id: number) => {
    await bedService.saveRemoveShowSensorId(bed_id, sensor_id);
  },

  saveBedConfig: async (bed_id: number, bed: BedSaveConfig) => {
    await bedService.saveBedConfig(bed_id, bed);
  },

  saveUpdatedBedConfig: async (bed_id: number, updatedBed: Bed) => {
    set((state) => ({
      beds: state.beds.map((bed) =>
        bed.bed_id === bed_id ? { ...bed, ...updatedBed } : bed
      ),
    }));
  },

  getLocations: async () => {
    return await bedService.getLocations();
  },

  getBedsFree: async () => {
    return await bedService.getBedsFree();
  },

  getBed: async (bed_id: number) => {
    return await bedService.getBed(bed_id);
  },

  getBeds: async () => {
    return await bedService.getBeds();
  },

  deleteBed: async (bed_id: number) => {
    await bedService.deleteBed(bed_id);
  },

  addBed: async (bed: AddBed) => {
    await bedService.addBed(bed);
  },

  editBed: async (bed_id: number, bed: Bed) => {
    bed.room_id = bed.room.room_id
    await bedService.editBed(bed_id, bed);
  },
}));
