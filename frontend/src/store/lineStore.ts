import { create } from "zustand"; 
import { Line_Group } from "../types/line_group";
import { lineService } from "../services/lineService";

interface LineStore {
  lineGroups: Line_Group[];
  getLineGroups: () => Promise<Line_Group[]>;
  getLineGroupById: (line_group_id: string) => Promise<Line_Group | null>;
  updateLineGroup: (line_group_id: string, updateData: Line_Group) => Promise<void>;
  deleteLineGroup: (line_group_id: string) => Promise<void>;
}

export const useLineStore = create<LineStore>((set) => ({
  lineGroups: [],

  getLineGroups: async () => {
    try {
      const data = await lineService.getLineGroups();
      set({ lineGroups: data }); 
      return data;
    } catch (err) {
      console.error("Failed to fetch line groups:", err);
      return [];
    }
  },

  getLineGroupById: async (line_group_id: string) => {
    try {
      const data = await lineService.getLineGroupById(line_group_id);
      return data;
    } catch (err) {
      console.error("Failed to fetch line group:", err);
      return null;
    }
  },

  updateLineGroup: async (line_group_id: string, updateData: Line_Group) => {
    const updated = await lineService.updateLineGroup(line_group_id, updateData);
    set((state) => ({
      lineGroups: state.lineGroups.map((lg) =>
        lg.line_group_id === updated.line_group_id ? updated : lg
      ),
    }));
  },

  deleteLineGroup: async (line_group_id: string) => {
    await lineService.deleteLineGroup(line_group_id);
    set((state) => ({
      lineGroups: state.lineGroups.filter((lg) => lg.line_group_id !== String(line_group_id)),
    }));
  },
}));
