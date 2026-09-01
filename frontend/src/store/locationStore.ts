import { create } from "zustand";
import { Building } from "../types/building";
import { Room } from "../types/room";
import { locationService } from "../services/locationService";

interface LocationStore {
  getLocations: () => Promise<Building[]>;
  deleteBuilding: (building_id: number) => Promise<void>;
  createBuildingFloor: (building: {
    building_name: string;
    floor_count: number;
  }) => Promise<void>;
  editBuildingFloor: (
    building_id: number,
    building: { building_name: string; floor_count: number }
  ) => Promise<void>;
  editFloor: (floor_id: number, floor: { floor_name: string }) => Promise<void>;
  createRoom: (room: Room) => Promise<void>;
  editRoom: (room_id: number, room: Room) => Promise<void>;
  deleteRoom: (room_id: number) => Promise<void>;
  importLocation: (file: File) => Promise<void>;
}

export const useLocationStore = create<LocationStore>(() => ({
  getLocations: async () => {
    return await locationService.getLocations();
  },

  deleteBuilding: async (building_id: number) => {
    await locationService.deleteBuilding(building_id);
  },

  createBuildingFloor: async (building) => {
    await locationService.createBuildingFloor(building);
  },

  editBuildingFloor: async (building_id, building) => {
    await locationService.editBuildingFloor(building_id, building);
  },

  editFloor: async (floor_id, floor) => {
    await locationService.editFloor(floor_id, floor);
  },

  createRoom: async (room: Room) => {
    await locationService.createRoom(room);
  },

  editRoom: async (room_id, room) => {
    await locationService.editRoom(room_id, room);
  },

  deleteRoom: async (room_id) => {
    await locationService.deleteRoom(room_id);
  },
  importLocation: async (file: File) => {
    await locationService.importLocation(file); // 👈 เพิ่มตรงนี้
  },
}));
