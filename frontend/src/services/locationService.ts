import http from "./http";
import { Room } from "../types/room";
import { MOCK_BUILDINGS } from "./mockData";

export const locationService = {
  async getLocations() {
    try {
      const res = await http.get("/buildings");
      return res.data?.length ? res.data : MOCK_BUILDINGS;
    } catch {
      return MOCK_BUILDINGS;
    }
  },

  async deleteBuilding(building_id: number) {
    try {
      await http.delete(`/buildings/${building_id}`);
    } catch {
      return { success: true };
    }
  },

  async createBuildingFloor(building: {
    building_name: string;
    floor_count: number;
  }) {
    try {
      const res = await http.post("/buildings/create_with_floors", building);
      return res.data;
    } catch {
      return building;
    }
  },

  async editBuildingFloor(
    building_id: number,
    building: { building_name: string }
  ) {
    try {
      const res = await http.patch(`/buildings/${building_id}`, building);
      return res.data;
    } catch {
      return building;
    }
  },

  async editFloor(floor_id: number, floor: { floor_name: string }) {
    try {
      const res = await http.patch(`/floors/${floor_id}`, floor);
      return res.data;
    } catch {
      return floor;
    }
  },

  async createRoom(room: Room) {
    try {
      const res = await http.post("/rooms/batch_create", room);
      return res.data;
    } catch {
      return room;
    }
  },

  async editRoom(room_id: number, room: Room) {
    try {
      const res = await http.patch(`/rooms/${room_id}`, room);
      return res.data;
    } catch {
      return room;
    }
  },

  async deleteRoom(room_id: number) {
    try {
      const res = await http.delete(`/rooms/${room_id}`);
      return res.data;
    } catch {
      return { success: true };
    }
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
    } catch {
      return { success: true };
    }
  },
};
