import React, { useState, useEffect } from "react";
import Icon from "@mdi/react";
import {
  mdiHomePlus,
  // mdiPencil,
  // mdiTrashCan,
  mdiMagnify,
  mdiChevronDown,
  mdiChevronRight,
  mdiFileImport,
} from "@mdi/js";
import { useLocationStore } from "../../store/locationStore";
import { Building } from "../../types/building";
import LocationDialog from "../../components/Managements/Location/LocationDialog";
import DeleteLocationDialog from "../../components/Managements/Location/DeleteLocationDialog";
import DeleteRoomDialog from "../../components/Managements/Location/DeleteRoomDialog";
import { Room } from "../../types/room";
import RoomDialog from "../../components/Managements/Location/RoomDialog";
import AddRoomDialog from "../../components/Managements/Location/AddRoomDialog"; // นำเข้า AddRoomDialog
import ImportDialog from "../../components/Managements/Location/ImportDialog"; // เพิ่ม import

const LocationManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const locationStore = useLocationStore();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [expandedBuildings, setExpandedBuildings] = useState<Set<number>>(
    new Set()
  );
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingBuilding, setDeletingBuilding] = useState<Building | null>(
    null
  );
  const [isDeleteRoomDialogOpen, setIsDeleteRoomDialogOpen] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false); // สถานะไดอะล้อกเพิ่มห้อง
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // ฟังก์ชันไดอะล้อกแก้ไขอาคาร
  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setIsDialogOpen(true);
  };
  const handleDeleteBuildingClick = (building: Building) => {
    setDeletingBuilding(building);
    setIsDeleteDialogOpen(true);
  };

  const handleAddRoom = (floor_id: number) => {
    setEditingRoom({ floor_id: floor_id, room_name: "" }); // เพิ่มห้องใหม่
    setIsAddRoomDialogOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room); // แก้ไขห้อง
    setIsRoomDialogOpen(true);
  };

  const handleDeleteRoomClick = (room: Room) => {
    setDeletingRoom(room);
    setIsDeleteRoomDialogOpen(true);
  };

  const handleSaveLocation = async (data: {
    name: string;
    floorCount: number;
  }) => {
    try {
      if (editingBuilding) {
        await locationStore.editBuildingFloor(editingBuilding.building_id!, {
          building_name: data.name,
          floor_count: data.floorCount,
        });
      } else {
        await locationStore.createBuildingFloor({
          building_name: data.name,
          floor_count: data.floorCount,
        });
      }
      await refreshLocations();
      setIsDialogOpen(false);
      setEditingBuilding(null);
    } catch (err) {
      console.error("❌ Failed to save location:", err);
      alert("ชื่ออาคารนี้ถูกใช้แล้ว กรุณาเปลี่ยนชื่ออาคาร");
      // alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const fetchLocationsData = async () => {
    const res = await locationStore.getLocations();
    setBuildings(res);
  };

  const refreshLocations = async () => {
    await fetchLocationsData();
    console.log("Locations refreshed");
  };

  useEffect(() => {
    fetchLocationsData();
  }, []);

  const toggleBuilding = (buildingId: number) => {
    setExpandedBuildings((prev) => {
      const updated = new Set(prev);
      if (updated.has(buildingId)) {
        updated.delete(buildingId);
      } else {
        updated.add(buildingId);
      }
      return updated;
    });
  };

  const toggleFloor = (buildingId: number, floorId: number) => {
    const key = `${buildingId}-${floorId}`;
    setExpandedFloors((prev) => {
      const updated = new Set(prev);
      if (updated.has(key)) {
        updated.delete(key);
      } else {
        updated.add(key);
      }
      return updated;
    });
  };

  const filteredBuildings = buildings.filter((building) =>
    building.building_name.includes(search)
  );

  return (
    <div className="p-6 bg-[#e7f0f3] min-h-screen">
      <h1 className="text-3xl font-bold text-[#2E5361] mb-4">จัดการอาคาร</h1>

      <div className="flex space-x-4 justify-between mb-6">
        <div className="relative flex-auto">
          <input
            id="searchLocation"
            type="text"
            placeholder="ค้นหาชื่ออาคาร"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered border-2 border-gray-400 rounded-lg p-2 pr-10 bg-white w-full inset-shadow"
          />
          <Icon
            path={mdiMagnify}
            size={1}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        </div>

        <button
          id="btnAddLocation"
          onClick={() => setIsDialogOpen(true)}
          className="ml-4 flex items-center gap-2 px-4 py-2 w-45 h-12 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] shadow-md transform hover:-translate-y-1 hover:scale-105 transition-transform cursor-pointer"
        >
          <Icon path={mdiHomePlus} className="text-black" size={1} />
          {/* <img 
            src="/src/assets/btnManagement/AddLocate.png" 
            alt="addWard"
            className="w-6" 
          /> */}
          เพิ่มอาคารใหม่
        </button>
        <button
          id="btnImportBuilding"
          onClick={() => setIsImportDialogOpen(true)}
          className="flex items-center justify-center px-3 py-2 w-12 h-12 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] shadow-md transform hover:-translate-y-1 hover:scale-105 transition-transform cursor-pointer"
          title="นำเข้าข้อมูลอาคาร"
        >
          <Icon path={mdiFileImport} size={1} className="text-black" />
        </button>
      </div>

      <div className="bg-white shadow-md overflow-hidden">
        {filteredBuildings.map((building) => {
          const buildingId = building.building_id!;
          const isBuildingExpanded = expandedBuildings.has(buildingId);

          return (
            <div key={buildingId} className="border-b border-gray-300">
              <div
                className="flex justify-between items-center p-4 bg-[#B7D6DE] cursor-pointer"
                onClick={() => toggleBuilding(buildingId)}
              >
                <div className="flex items-center gap-2 font-bold text-lg">
                  <Icon
                    path={isBuildingExpanded ? mdiChevronDown : mdiChevronRight}
                    size={1}
                  />
                  {building.building_name}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="editBuilding"
                    onClick={() => handleEditBuilding(building)}
                    className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                  >
                    <img src="/src/assets/edit.png" alt="edit" />
                  </button>
                  <button
                    id="delBuilding"
                    onClick={() => handleDeleteBuildingClick(building)}
                    className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                  >
                    <img src="/src/assets/delete.png" alt="delete" />
                  </button>
                </div>
              </div>

              {isBuildingExpanded &&
                (building.floor ?? []).map((floor) => {
                  const floorId = floor.floor_id!;
                  const floorKey = `${buildingId}-${floorId}`;
                  const isFloorExpanded = expandedFloors.has(floorKey);

                  return (
                    <div key={floorId}>
                      <div className="bg-[#cde4ec] border-b border-gray-300">
                        <div
                          className="flex justify-between items-center p-3 pl-8 cursor-pointer"
                          onClick={() => toggleFloor(buildingId, floorId)}
                        >
                          <div className="flex items-center gap-2 font-semibold">
                            <Icon
                              path={
                                isFloorExpanded
                                  ? mdiChevronDown
                                  : mdiChevronRight
                              }
                              size={0.9}
                            />
                            {floor.floor_name}
                            <span className="text-sm text-gray-700 ml-2">
                              ({floor.room?.length ?? 0} ห้อง)
                            </span>
                          </div>
                          <button
                            id="addRoom"
                            onClick={() => handleAddRoom(floorId)}
                            className="bg-[#5C929F] text-white text-base rounded-2xl px-4 py-1 hover:bg-[#5E8892] shadow-md transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110 cursor-pointer"
                          >
                            เพิ่มห้อง
                          </button>
                        </div>
                      </div>

                      {isFloorExpanded && (
                        <div>
                          {floor.room?.map((room) => (
                            <div
                              key={room.room_id}
                              className="border-b border-gray-200 bg-gradient-to-r from-white via-gray-100 to-white"
                            >
                              <div className="flex justify-between items-center p-3 pl-16">
                                <div>{room.room_name}</div>
                                <div className="flex gap-4 items-center">
                                  <span
                                    className={`font-medium ${
                                      room.ward_id != null
                                        ? "text-green-600"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {room.ward_id != null
                                      ? "Active"
                                      : "Inactive"}
                                  </span>
                                  <button
                                    id="editFloor"
                                    onClick={() => handleEditRoom(room)}
                                    className="mx-1 cursor-pointer w-6 h-6 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                                  >
                                    <img
                                      src="/src/assets/edit.png"
                                      alt="edit"
                                    />
                                  </button>
                                  <button
                                    id="delFloor"
                                    onClick={() => handleDeleteRoomClick(room)}
                                    className="mx-1 cursor-pointer w-6 h-6 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                                  >
                                    <img
                                      src="/src/assets/delete.png"
                                      alt="delete"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
      {/* Dialog สำหรับเพิ่มอาคาร */}
      <LocationDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingBuilding(null);
        }}
        initialLocationData={{
          name: editingBuilding?.building_name || "",
          floorCount: editingBuilding?.floor?.length || 0,
        }}
        onSubmit={handleSaveLocation}
      />
      <DeleteLocationDialog
        isOpen={isDeleteDialogOpen}
        onCancel={() => setIsDeleteDialogOpen(false)}
        building={deletingBuilding}
        onDeleted={refreshLocations} // ใช้ callback ที่สร้างไว้
      />

      {/* Dialog สำหรับเพิ่ม/แก้ไข ห้อง */}
      <AddRoomDialog
        isOpen={isAddRoomDialogOpen}
        onSubmit={async () => {
          await refreshLocations();
        }}
        onClose={() => {
          setIsAddRoomDialogOpen(false);
          setEditingRoom(undefined);
        }}
        initialRoom={editingRoom}
      />

      <RoomDialog
        isOpen={isRoomDialogOpen}
        onSubmit={async () => {
          await refreshLocations();
        }}
        onClose={() => {
          setIsRoomDialogOpen(false);
          setEditingRoom(undefined);
        }}
        initialRoom={editingRoom}
      />

      <DeleteRoomDialog
        isOpen={isDeleteRoomDialogOpen}
        onSubmit={async () => {
          await refreshLocations();
        }}
        onCancel={() => {
          setIsDeleteRoomDialogOpen(false);
          setDeletingRoom(null);
        }}
        room={deletingRoom}
      />
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onConfirm={async () => {
          await refreshLocations(); // รีโหลดข้อมูลหลัง import
        }}
      />
    </div>
  );
};

export default LocationManagement;
