import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Ward } from "../../../types/ward";
import { AnimatePresence, motion } from "framer-motion";
import { Building } from "../../../types/building";
import { useWardStore } from "../../../store/wardStore";
import { useLocationStore } from "../../../store/locationStore";

interface WardDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialData?: Ward | null;
}

const WardDialog: React.FC<WardDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [wardName, setWardName] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [buildingId, setBuildingId] = useState<number | "">("");
  const [locations, setLocations] = useState<Building[]>([]);
  const [floorId, setFloorId] = useState<number | "">("");
  const locationStore = useLocationStore();
  const wardStore = useWardStore();

  const buildingOptions = locations;
  const selectedBuilding = buildingOptions.find(
    (b) => b.building_id === buildingId
  );
  const floorOptions = selectedBuilding?.floor ?? [];
  const selectedFloor = floorOptions.find((f) => f.floor_id === floorId);

  // ห้องในชั้นที่เลือก (เฉพาะที่ยังไม่ถูก assign ward หรืออยู่ใน ward ปัจจุบัน)
  const roomOptions =
    selectedFloor?.room?.filter(
      (r) => r.ward_id === null || r.ward_id === initialData?.ward_id
    ) ?? [];

  useEffect(() => {
    const fetchLocationsData = async () => {
      const res = await locationStore.getLocations();
      setLocations(res);
    };
    fetchLocationsData();
  }, []);

  useEffect(() => {
    if (!open) return;

    if (initialData && locations.length) {
      // EDIT MODE
      setWardName(initialData.ward_name);

      const firstRoom = initialData.room?.[0];
      setBuildingId(firstRoom?.floor?.building.building_id || "");
      setFloorId(firstRoom?.floor?.floor_id || "");

      setSelectedRooms(
        initialData.room?.map((r) => r.room_id!).filter(Boolean) || []
      );
    } else if (!initialData) {
      // ADD MODE
      setWardName("");
      setBuildingId("");
      setFloorId("");
      setSelectedRooms([]);
    }
  }, [open, initialData, locations]);

  // ✅ check select all ของชั้นนี้เท่านั้น
  const allSelected =
    roomOptions.length > 0 &&
    roomOptions.every((r) => selectedRooms.includes(r.room_id!));

  const handleRoomToggle = (roomId: number) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  // ✅ toggle all ของชั้นนี้ โดยไม่กระทบห้องของชั้นอื่น
  const handleToggleAll = () => {
    if (allSelected) {
      // unselect → เอาออกเฉพาะห้องของชั้นนี้
      setSelectedRooms((prev) =>
        prev.filter((id) => !roomOptions.some((r) => r.room_id === id))
      );
    } else {
      // select all → รวมกับห้องที่เลือกไว้จากชั้นอื่น
      setSelectedRooms((prev) => {
        const newIds = roomOptions.map((r) => r.room_id!);
        return [...new Set([...prev, ...newIds])];
      });
    }
  };

  const handleSubmit = async () => {
    if (!wardName) {
      alert("กรุณากรอกชื่อวอร์ด");
      return;
    }
    const payload = {
      ward_name: wardName,
      room_ids: selectedRooms, // ✅ ส่งได้แม้เป็น []
    };

    try {
      if (initialData?.ward_id) {
        await wardStore.updateWard(initialData.ward_id, payload);
      } else {
        await wardStore.addWard(payload);
      }

      onSubmit();
      onClose();
    } catch (err) {
      console.error("Error saving ward:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกวอร์ด");
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="fixed inset-0 z-50 flex justify-center items-center"
      >
        <div
          className="bg-white rounded-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-3xl font-semibold text-center text-[#2E5361] mb-4">
            {initialData?.ward_id ? "แก้ไขวอร์ด" : "เพิ่มวอร์ดใหม่"}
          </h2>

          {/* Ward Name */}
          <div className="mb-3">
            <label className="block mb-1 font-semibold text-gray-700">
              ชื่อวอร์ด :
            </label>
            <input
              id="wardName"
              type="text"
              className="p-2 pl-3 border border-gray-300 rounded-md w-full h-11 placeholder:text-gray-400"
              value={wardName}
              onChange={(e) => setWardName(e.target.value)}
              placeholder="กรุณากรอกชื่อวอร์ด"
            />
          </div>

          {/* Building and Floor */}
          <div className="flex gap-4 mb-3">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">
                อาคาร :
              </label>
              <select
                id="building"
                value={buildingId}
                onChange={(e) => setBuildingId(Number(e.target.value) || "")}
                className={`p-2 border border-gray-300 rounded-md w-full h-11 cursor-pointer ${
                  buildingId ? "text-black" : "text-gray-400"
                }`}
              >
                <option value="" disabled hidden>
                  กรุณาเลือกอาคาร
                </option>
                {buildingOptions.map((b) => (
                  <option
                    key={b.building_id}
                    value={b.building_id}
                    className="text-black"
                  >
                    {b.building_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">
                ชั้น :
              </label>
              <select
                id="floor"
                value={floorId}
                onChange={(e) => setFloorId(Number(e.target.value) || "")}
                disabled={buildingId === ""}
                className={`p-2 border border-gray-300 rounded-md w-full h-11 bg-white disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer ${
                  floorId ? "text-black" : "text-gray-400"
                }`}
              >
                <option value="" disabled hidden>
                  กรุณาเลือกชั้น
                </option>
                {floorOptions.map((f) => (
                  <option
                    key={f.floor_id}
                    value={f.floor_id}
                    className="text-black"
                  >
                    {f.floor_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room Selection */}
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-2">
              ห้อง :
            </label>

            {/* แสดงห้องที่เลือกไว้ทั้งหมด */}
            {selectedRooms.length > 0 && (
            <div className="mb-2 p-2 border rounded bg-gray-50">
              <p className="font-medium text-gray-600 mb-1">ห้องที่เลือกไว้:</p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {locations
                  .flatMap((b) =>
                    b.floor?.flatMap((f) => f.room ?? []) ?? []
                  )
                  .filter((r) => selectedRooms.includes(r.room_id!))
                  .map((room) => (
                    <span
                      key={room.room_id}
                      className="px-2 py-1 bg-[#B7D6DE] text-[#2E5361] rounded-lg text-sm flex items-center gap-1"
                    >
                      {room.room_name}
                      <button
                        onClick={() =>
                          setSelectedRooms((prev) =>
                            prev.filter((id) => id !== room.room_id)
                          )
                        }
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}

            <div className="border rounded overflow-hidden">
              <table className="w-full table-fixed text-left">
                <thead className="bg-[#B7D6DE]">
                  <tr>
                    <th className="w-15 p-2 text-center border-r">
                      <input
                        id="allSelected"
                        type="checkbox"
                        disabled={floorId === ""}
                        checked={allSelected}
                        onChange={handleToggleAll}
                      />
                    </th>
                    <th className="p-4">ห้อง</th>
                  </tr>
                </thead>
              </table>
              <div className="max-h-[180px] overflow-y-auto">
                <table className="w-full table-fixed text-left">
                  <tbody>
                    {roomOptions.map((room) => (
                      <tr key={room.room_id} className="border-t">
                        <td className="w-15 p-2 text-center border-r">
                          <input
                            id="select"
                            type="checkbox"
                            disabled={floorId === ""}
                            checked={selectedRooms.includes(room.room_id!)}
                            onChange={() => handleRoomToggle(room.room_id!)}
                          />
                        </td>
                        <td className="p-4">{room.room_name}</td>
                      </tr>
                    ))}
                    {roomOptions.length === 0 && (
                      <tr>
                        <td colSpan={2} className="text-center p-4 text-gray-400">
                          กรุณาเลือกอาคารและชั้นก่อน
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              id="btnCancel"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
            >
              ยกเลิก
            </button>
            <button
              id="btnSave"
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-gray-400 cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
            >
              บันทึก
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default WardDialog;
