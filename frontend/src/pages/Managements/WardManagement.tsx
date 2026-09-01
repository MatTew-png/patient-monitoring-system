import React, { useState, useEffect } from "react";
import Icon from "@mdi/react";
import {
  // mdiHomePlus,
  mdiMagnify,
  mdiChevronDown,
  mdiChevronRight,
} from "@mdi/js";
import { Ward } from "../../types/ward";
import WardDialog from "../../components/Managements/Ward/WardDialog";
import DeleteWardDialog from "../../components/Managements/Ward/DeleteWardDialog";
import { useWardStore } from "../../store/wardStore";

const WardManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [wards, setWards] = useState<Ward[]>([]);
  const wardStore = useWardStore();
  const [expandedWards, setExpandedWards] = useState<Set<number>>(new Set());
  const [showDialog, setShowDialog] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null | undefined>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingWard, setDeletingWard] = useState<Ward | null>(null);

  const fetchWards = async () => {
    try {
      const data = await wardStore.getWards();
      setWards(data);
    } catch (error) {
      console.error("Failed to fetch wards:", error);
    }
  };

  const refreshGetWards = async () => {
    await fetchWards();
  };

  useEffect(() => {
    fetchWards();
  }, []);

  // useEffect(() => {
  //   setWards([
  //     {
  //       ward_id: 1,
  //       ward_name: "วอร์ดอายุรกรรม",
  //       room: [
  //         {
  //           room_id: 101,
  //           room_name: "ห้อง 101",
  //           floor: {
  //             floor_id: 1,
  //             floor_name: "ชั้น 1",
  //             building: {
  //               building_id: 1,
  //               building_name: "อาคาร A",
  //             },
  //           },
  //         },
  //         {
  //           room_id: 102,
  //           room_name: "ห้อง 102",
  //           floor: {
  //             floor_id: 2,
  //             floor_name: "ชั้น 2",
  //             building: {
  //               building_id: 1,
  //               building_name: "อาคาร A",
  //             },
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       ward_id: 2,
  //       ward_name: "วอร์ดศัลยกรรม",
  //       room: [
  //         {
  //           room_id: 101,
  //           room_name: "ห้อง 103",
  //           floor: {
  //             floor_id: 3,
  //             floor_name: "ชั้น 1",
  //             building: {
  //               building_id: 3,
  //               building_name: "อาคาร A",
  //             },
  //           },
  //         },
  //         {
  //           room_id: 102,
  //           room_name: "ห้อง 104",
  //           floor: {
  //             floor_id: 4,
  //             floor_name: "ชั้น 2",
  //             building: {
  //               building_id: 3,
  //               building_name: "อาคาร A",
  //             },
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       ward_id: 3,
  //       ward_name: "วอร์ดผู้ป่วยหนัก",
  //       room: [],
  //     },
  //     {
  //       ward_id: 4,
  //       ward_name: "วอร์ดเวชศาสตร์ฟื้นฟู",
  //       room: [],
  //     },
  //   ]);
  // }, []);

  const toggleWard = (wardId: number) => {
    setExpandedWards((prev) => {
      const updated = new Set(prev);
      if (updated.has(wardId)) {
        updated.delete(wardId);
      } else {
        updated.add(wardId);
      }
      return updated;
    });
  };

  const handleAddWard = () => {
    setEditingWard(null);
    setShowDialog(true);
  };

  const handleEditWard = (ward: Ward) => {
    setEditingWard(ward);
    setShowDialog(true);
  };

  const handleDeleteWard = (ward: Ward) => {
    setDeletingWard(ward);
    setShowDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingWard(null);
  };

  const filteredWards = wards.filter((ward) => ward.ward_name.includes(search));

  return (
    <div className="p-6 bg-[#e7f0f3] min-h-screen">
      <h1 className="text-3xl font-bold text-[#2E5361] mb-4">
        จัดการวอร์ดผู้ป่วย
      </h1>

      <div className="flex space-x-4 justify-between mb-6">
        <div className="relative flex-auto">
          <input
            id="searchWard"
            type="text"
            placeholder="ค้นหาวอร์ด"
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
          id="btnAddWard"
          className="ml-4 flex items-center gap-2 px-4 py-2 w-45 h-12 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] shadow-md transform hover:-translate-y-1 hover:scale-105 transition-transform cursor-pointer"
          onClick={handleAddWard}
        >
          {/* <Icon path={mdiHomePlus} size={1} /> */}
          <img
            src="/src/assets/btnManagement/AddWard.png"
            alt="addWard"
            className="w-7"
          />
          เพิ่มวอร์ดใหม่
        </button>
      </div>

      <div className="bg-white rounded-none shadow-md overflow-hidden">
        {filteredWards.map((ward) => {
          const isExpanded = expandedWards.has(ward.ward_id!);
          return (
            <div key={ward.ward_id} className="border-b border-gray-300">
              <div
                className="flex justify-between items-center p-4 bg-[#B7D6DE] cursor-pointer"
                onClick={() => toggleWard(ward.ward_id!)}
              >
                <div className="flex items-center gap-2 font-bold text-lg">
                  <Icon
                    path={isExpanded ? mdiChevronDown : mdiChevronRight}
                    size={1}
                  />
                  {ward.ward_name}
                  <span className="text-sm text-gray-700 ml-2">
                    ({ward.room?.length ?? 0} ห้อง)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="edit"
                    onClick={() => handleEditWard(ward)}
                    className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                  >
                    <img src="/src/assets/edit.png" alt="edit" />
                  </button>
                  <button
                    id="delete"
                    onClick={(e) => {
                      e.stopPropagation(); // ป้องกัน toggle expand ด้วย
                      handleDeleteWard(ward);
                    }}
                    className="mx-1 cursor-pointer w-7 h-7 transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
                  >
                    <img src="/src/assets/delete.png" alt="delete" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="ml-8">
                  {ward.room && ward.room.length === 0 ? (
                    <div className="p-3 text-gray-500 italic">-</div>
                  ) : (
                    ward.room?.map((room) => (
                      <div
                        key={room.room_id}
                        className="flex justify-between items-center p-3 border-b border-gray-200 bg-gradient-to-r from-white via-gray-100 to-white"
                      >
                        <div>{room.room_name}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <WardDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        initialData={editingWard}
        onSubmit={refreshGetWards}
      />
      {/* DeleteWardDialog */}
      {deletingWard && (
        <DeleteWardDialog
          isOpen={showDeleteDialog}
          onCancel={handleCloseDeleteDialog}
          initialWardData={deletingWard}
          onConfirm={refreshGetWards}
        />
      )}
    </div>
  );
};

export default WardManagement;
