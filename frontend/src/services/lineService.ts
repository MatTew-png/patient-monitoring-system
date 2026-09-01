import { Line_Group } from "../types/line_group";
import http from "./http";

export const lineService = {
  async getLineGroups(): Promise<Line_Group[]> {
    const res = await http.get("/line_group");
    return res.data;
  },

  async getLineGroupById(line_group_id: string): Promise<Line_Group> {
    const res = await http.get(`/line_group/${line_group_id}`);
    return res.data;
  },

  async updateLineGroup(line_group_id: string, updateData: Line_Group): Promise<Line_Group> {
    const res = await http.put(`/line_group/${line_group_id}`, updateData);
    return res.data;
  },

  async deleteLineGroup(line_group_id: string): Promise<Line_Group> {
    const res = await http.delete(`/line_group/${line_group_id}`);
    return res.data;
  },
};
