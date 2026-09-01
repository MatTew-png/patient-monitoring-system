import { useAuthStore } from "../store/authStore";
import { AddBed, Bed, BedSaveConfig } from "../types/bed";
import http from "./http";
import { MOCK_BEDS, MOCK_BUILDINGS } from "./mockData";

export const bedService = {
  async loadBedActivatedAll(): Promise<Bed[]> {
    try {
      const { token, tokenType } = useAuthStore.getState();
      const response = await http.get("beds/page/activated?limit=6", {
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
      });
      return response.data?.length ? response.data : MOCK_BEDS;
    } catch (error) {
      console.warn("Using mock data for loadBedActivatedAll:", error);
      return MOCK_BEDS;
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
      return response.data ?? MOCK_BEDS.length;
    } catch (error) {
      console.warn("Using mock count for countBedActivatedAll:", error);
      return MOCK_BEDS.length;
    }
  },

  async getBedsFreeByWard(): Promise<Bed[]> {
    try {
      const { token, tokenType } = useAuthStore.getState();
      const response = await http.get(`beds/free/ward`, {
        headers: {
          Authorization: `${tokenType} ${token}`,
        },
      });
      return response.data?.length ? response.data : MOCK_BEDS;
    } catch (error) {
      console.warn("Using mock data for getBedsFreeByWard:", error);
      return MOCK_BEDS;
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
      return response.data?.length ? response.data : MOCK_BEDS;
    } catch (error) {
      console.warn("Using mock data for loadBedsByPage:", error);
      return MOCK_BEDS;
    }
  },

  async saveSelectedShowSensorId(bed_id: number, sensor_id: number): Promise<Bed> {
    try {
      const response = await http.patch(`beds/${bed_id}/selectedShowSensorId/${sensor_id}`);
      return response.data;
    } catch {
      const found = MOCK_BEDS.find((b) => b.bed_id === Number(bed_id)) || MOCK_BEDS[0];
      return found;
    }
  },

  async saveRemoveShowSensorId(bed_id: number, sensor_id: number): Promise<Bed> {
    try {
      const response = await http.patch(`beds/${bed_id}/removeShowSensorId/${sensor_id}`);
      return response.data;
    } catch {
      const found = MOCK_BEDS.find((b) => b.bed_id === Number(bed_id)) || MOCK_BEDS[0];
      return found;
    }
  },

  async saveBedConfig(bed_id: number, bed: BedSaveConfig): Promise<BedSaveConfig> {
    try {
      const response = await http.patch(`beds/${bed_id}/bedConfig`, bed);
      return response.data;
    } catch {
      return bed;
    }
  },

  async loadBedSensorConfig(bed_id: number): Promise<Bed> {
    try {
      const response = await http.get(
        `/sensor_notifications_configs/sensor-notifications-config/${bed_id}`
      );
      return response.data;
    } catch {
      return MOCK_BEDS.find((b) => b.bed_id === Number(bed_id)) || MOCK_BEDS[0];
    }
  },

  async removePatientFromBed(bed_id: number, patient_id: number): Promise<Bed> {
    try {
      const response = await http.put(`/beds/${bed_id}/remove-patient/${patient_id}`);
      return response.data;
    } catch {
      return MOCK_BEDS.find((b) => b.bed_id === Number(bed_id)) || MOCK_BEDS[0];
    }
  },

  async getLocations() {
    try {
      const res = await http.get("/buildings");
      return res.data?.length ? res.data : MOCK_BUILDINGS;
    } catch {
      return MOCK_BUILDINGS;
    }
  },

  async getBedsFree() {
    try {
      const res = await http.get("/beds/free/all");
      return res.data?.length ? res.data : MOCK_BEDS;
    } catch {
      return MOCK_BEDS;
    }
  },

  async getBed(bed_id: number) {
    try {
      const res = await http.get(`/beds/${bed_id}`);
      return res.data || MOCK_BEDS.find((b) => b.bed_id === Number(bed_id)) || MOCK_BEDS[0];
    } catch {
      return MOCK_BEDS.find((b) => b.bed_id === Number(bed_id)) || MOCK_BEDS[0];
    }
  },

  async getBeds() {
    try {
      const res = await http.get(`/beds`);
      return res.data?.length ? res.data : MOCK_BEDS;
    } catch {
      return MOCK_BEDS;
    }
  },

  async deleteBed(bed_id: number) {
    try {
      const res = await http.delete(`/beds/${bed_id}`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  async addBed(bed: AddBed): Promise<AddBed> {
    try {
      const response = await http.post("beds", bed);
      return response.data;
    } catch {
      return bed;
    }
  },

  async editBed(bed_id: number, bed: Bed): Promise<Bed> {
    try {
      const response = await http.patch(`beds/edit/${bed_id}`, bed);
      return response.data;
    } catch {
      return bed;
    }
  },
};
