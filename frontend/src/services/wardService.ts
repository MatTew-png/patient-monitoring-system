import http from "./http";
import { AddWard, Ward } from "../types/ward";

export const wardService = {
  async getWards(): Promise<Ward[]> {
    const res = await http.get("/wards/all/full_details");
    return res.data;
  },
  async getWard(ward_id: number): Promise<Ward> {
    const res = await http.get(`/wards/${ward_id}/full_details`);
    return res.data;
  },
  async addWard(addWard: AddWard): Promise<Ward> {
    const res = await http.post(`/wards`, addWard);
    return res.data;
  },
  async updateWard(ward_id: number, updateData: AddWard): Promise<Ward> {
    const res = await http.patch(`/wards/${ward_id}`, updateData);
    return res.data;
  },
  async deleteWard(ward_id: number): Promise<Ward> {
    const res = await http.delete(`/wards/${ward_id}`);
    return res.data;
  },
};
