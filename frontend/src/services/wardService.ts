import http from "./http";
import { AddWard, Ward } from "../types/ward";
import { MOCK_WARD } from "./mockData";

export const wardService = {
  async getWards(): Promise<Ward[]> {
    try {
      const res = await http.get("/wards/all/full_details");
      return res.data?.length ? res.data : [MOCK_WARD];
    } catch {
      return [MOCK_WARD];
    }
  },
  async getWard(ward_id: number): Promise<Ward> {
    try {
      const res = await http.get(`/wards/${ward_id}/full_details`);
      return res.data || MOCK_WARD;
    } catch {
      return MOCK_WARD;
    }
  },
  async addWard(addWard: AddWard): Promise<Ward> {
    try {
      const res = await http.post(`/wards`, addWard);
      return res.data;
    } catch {
      return { ward_id: 2, ...addWard } as Ward;
    }
  },
  async updateWard(ward_id: number, updateData: AddWard): Promise<Ward> {
    try {
      const res = await http.patch(`/wards/${ward_id}`, updateData);
      return res.data;
    } catch {
      return { ward_id, ...updateData } as Ward;
    }
  },
  async deleteWard(ward_id: number): Promise<Ward> {
    try {
      const res = await http.delete(`/wards/${ward_id}`);
      return res.data;
    } catch {
      return MOCK_WARD;
    }
  },
};
