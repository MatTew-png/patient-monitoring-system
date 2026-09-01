import http from "./http";
import { Room } from "../types/room";

export const locationService = {
  async getLocations() {
    const res = await http.get("/buildings");
    return res.data;
  },

  async deleteBuilding(building_id: number) {
    await http.delete(`/buildings/${building_id}`);
  },

  async createBuildingFloor(building: {
    building_name: string;
    floor_count: number;
  }) {
    const res = await http.post("/buildings/create_with_floors", building);
    return res.data;
  },

  async editBuildingFloor(
    building_id: number,
    building: { building_name: string }
  ) {
    const res = await http.patch(`/buildings/${building_id}`, building);
    return res.data;
  },

  async editFloor(floor_id: number, floor: { floor_name: string }) {
    const res = await http.patch(`/floors/${floor_id}`, floor);
    return res.data;
  },

  async createRoom(room: Room) {
    const res = await http.post("/rooms/batch_create", room);
    return res.data;
  },

  async editRoom(room_id: number, room: Room) {
    const res = await http.patch(`/rooms/${room_id}`, room);
    return res.data;
  },

  async deleteRoom(room_id: number) {
    const res = await http.delete(`/rooms/${room_id}`);
    return res.data;
  },

  async importLocation(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await http.post("/buildings/import_location", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      console.error("Error importing location:", error);
      throw error;
    }
  },
};
