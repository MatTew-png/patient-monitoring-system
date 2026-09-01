import { useAuthStore } from "../store/authStore";
import { AddBed, Bed, BedSaveConfig } from "../types/bed";
import http from "./http";

export const bedService = {
  async loadBedActivatedAll(): Promise<Bed[]> {
    try {
      const { token, tokenType } = useAuthStore.getState();
      const response = await http.get("beds/page/activated?limit=6", {
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error loading activated beds:", error);
      throw error;
    }
  },

  async countBedActivatedAll(): Promise<number> {
    try {
      const { token, tokenType } = useAuthStore.getState();
      const response = await http.get("beds/page/activated/count", {
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error loading activated beds:", error);
      throw error;
    }
  },

  async getBedsFreeByWard(): Promise<Bed[]> {
    try {
      const { token, tokenType } = useAuthStore.getState();
      
      const response = await http.get(
        `beds/free/ward`,
        {
          headers: {
            Authorization: `${tokenType} ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error loading bedsFreeByWard:", error);
      throw error;
    }
  },

  async loadBedsByPage(page: number, limit: number = 6): Promise<Bed[]> {
    const skip = (page - 1) * limit;
    try {
      const { token, tokenType } = useAuthStore.getState();
      const response = await http.get(
        `beds/page/activated?limit=${limit}&skip=${skip}`,
        {
          headers: {
            Authorization: `${tokenType} ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error loading paginated beds:", error);
      throw error;
    }
  },

  async saveSelectedShowSensorId(bed_id: number, sensor_id: number): Promise<Bed> {
    const response = await http.patch(`beds/${bed_id}/selectedShowSensorId/${sensor_id}`);
    return response.data;
  },

  async saveRemoveShowSensorId(bed_id: number, sensor_id: number): Promise<Bed> {
    const response = await http.patch(`beds/${bed_id}/removeShowSensorId/${sensor_id}`);
    return response.data;
  },

  async saveBedConfig(bed_id: number, bed: BedSaveConfig): Promise<BedSaveConfig> {
    const response = await http.patch(`beds/${bed_id}/bedConfig`, bed);
    return response.data;
  },

  async loadBedSensorConfig(bed_id: number): Promise<Bed> {
    const response = await http.get(
      `/sensor_notifications_configs/sensor-notifications-config/${bed_id}`
    );
    return response.data;
  },

  async removePatientFromBed(bed_id: number, patient_id: number): Promise<Bed> {
    const response = await http.put(`/beds/${bed_id}/remove-patient/${patient_id}`);
    return response.data;
  },

  async getLocations() {
    const res = await http.get("/buildings");
    return res.data;
  },
  async getBedsFree() {
    const res = await http.get("/beds/free/all");
    return res.data;
  },
  async getBed(bed_id: number) {
    const res = await http.get(`/beds/${bed_id}`);
    return res.data;
  },
  async getBeds() {
    const res = await http.get(`/beds`);
    return res.data;
  },
  async deleteBed(bed_id: number) {
    const res = await http.delete(`/beds/${bed_id}`);
    return res.data;
  },
  async addBed(bed: AddBed): Promise<AddBed> {
    const response = await http.post("beds", bed);
    return response.data;
  },

  async editBed(bed_id: number, bed: Bed): Promise<Bed> {
    const response = await http.patch(`beds/edit/${bed_id}`, bed);
    return response.data;
  },
};
