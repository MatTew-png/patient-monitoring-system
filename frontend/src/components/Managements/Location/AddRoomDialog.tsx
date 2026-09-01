import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import { Room } from "../../../types/room";
import { useLocationStore } from "../../../store/locationStore";

interface AddRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialRoom?: Room;
}

const AddRoomDialog: React.FC<AddRoomDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRoom = {
    room_id: 0,
    room_name: "",
  },
}) => {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [roomType, setRoomType] = useState(""); // ดึงจาก room_name
  const [roomNumber, setRoomNumber] = useState(""); // ดึงจาก room_name
  const [roomCount, setRoomCount] = useState(""); // จำนวนห้องที่ต้องการเพิ่ม
  const [floorId, setFloorId] = useState(initialRoom.floor_id);
  const locationStore = useLocationStore();

  useEffect(() => {
    if (isOpen) {
      setRoom(initialRoom);
      setFloorId(initialRoom.floor_id);
    }
  }, [isOpen, initialRoom]);

  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setRoomType(newType);
    updateRoomName(newType, roomCount);
  };

  const handleRoomCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;
    setRoomCount(newNumber);
    updateRoomName(roomType, Number(newNumber));
  };

  const updateRoomName = (type: string, roomCount?: number) => {
    const name = type;
    setRoom((prev) => ({
      ...prev,
      room_name: name,
      room_count: roomCount, // ตั้งค่า room_count ใน object room
    }));
  };

  const handleCancel = () => {
    setRoom({ room_id: 0, room_name: "" });
    setFloorId(0);
    setRoomType("");
    setRoomCount(undefined);
    onSubmit();
    onClose();
  };

  const handleSave = async () => {
    if (!room.room_name) {
      alert("กรุณากรอกชื่อห้อง");
      return;
    }
    if (roomCount < 1 || roomCount > 99) {
      alert("กรุณากรอกจำนวนห้องที่ต้องการเพิ่ม (1-99)");
      return;
    }
    try {
      if (room.room_id === 0 || room.room_id === undefined) {
        room.floor_id = floorId;
        console.log("Creating room:", room);
        await locationStore.createRoom(room);
      }
      if (room.room_id !== undefined && room.room_id !== 0) {
        await locationStore.editRoom(room.room_id, room);
      }
      if (onSubmit) {
        onSubmit(); // รอให้ refreshLocations ทำงาน
      }
      setFloorId(0);
      setRoomType("");
      setRoomCount(undefined);
      onClose();
      // window.location.reload();
    } catch (error) {
      console.error("Error saving room:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลห้อง");
    }
  };

  if (!isOpen) return null;

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
          className="bg-white p-6 rounded-xl shadow-lg w-[500px] max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-3xl font-semibold text-center mb-6 text-[#2E5361]">
            {room.room_id ? "แก้ไขข้อมูลห้อง" : "เพิ่มข้อมูลห้องใหม่"}
          </h2>

          {/* ประเภทห้อง */}
          <div className="flex items-center">
            <label className="w-35 text-right mr-4 font-semibold text-gray-700">
              ประเภทห้อง:
            </label>
            <select
              id="roomType"
              value={roomType}
              onChange={handleRoomTypeChange}
              className={`w-60 p-2 border border-gray-300 rounded-md h-10  mb-4 cursor-pointer ${
                roomType ? "text-black" : "text-gray-400"
              }`}
            >
              <option value="" disabled hidden>
                กรุณาเลือกประเภทห้อง
              </option>
              <option value="ห้องพักฟื้น" className="text-black">
                ห้องพักฟื้น
              </option>
              <option value="ห้องผ่าตัด" className="text-black">
                ห้องผ่าตัด
              </option>
              <option value="ห้องพิเศษ" className="text-black">
                ห้องพิเศษ
              </option>
              <option value="ห้องไอซียู" className="text-black">
                ห้องไอซียู
              </option>
            </select>
          </div>

          {/* จำนวนห้อง */}
          <div className="flex items-center">
            <label className="w-35 text-right mr-4 font-semibold text-gray-700">
              จำนวนห้อง:
            </label>
            <input
              id="roomCount"
              type="number"
              value={roomCount}
              onChange={handleRoomCountChange}
              placeholder="กรุณากรอกจำนวนห้อง เช่น 10"
              className="w-60 p-2 border border-gray-300 rounded-md h-10 mb-4"
            />
          </div>

          {/* Preview */}
          {/* <div className="flex items-center mb-2 text-sm text-gray-600">
            <div className="w-35 text-right shrink-0">ห้อง: </div>
            <div className="ml-4">{room.room_name}</div>
          </div> */}

          {/* ปุ่ม */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              id="btnCancel"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition hover:-translate-y-1 hover:scale-105 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              id="btnSave"
              className="px-6 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] transition hover:-translate-y-1 hover:scale-105 cursor-pointer"
              onClick={handleSave}
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

export default AddRoomDialog;
