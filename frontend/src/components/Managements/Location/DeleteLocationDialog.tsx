import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building } from "../../../types/building";
import { useLocationStore } from "../../../store/locationStore";

interface DeleteLocationDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  building: Building | null;
  onDeleted: () => void; // ✅ เพิ่ม callback
}

const DeleteLocationDialog: React.FC<DeleteLocationDialogProps> = ({
  isOpen,
  onCancel,
  onDeleted,
  building,
}) => {
  const [buildingData, setBuildingData] = useState<Building | null>(null);
  const locationStore = useLocationStore();

  useEffect(() => {
    if (isOpen && building) {
      setBuildingData(building);
    }
  }, [isOpen, building]);

  const saveDeleteBuilding = async () => {
    if (buildingData?.building_id) {
      await locationStore.deleteBuilding(buildingData.building_id);
       // ✅ เรียก callback หลังลบสำเร็จ
      onCancel();
      onDeleted();
    }
  };

  if (!isOpen || !buildingData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="fixed inset-0 z-50 flex justify-center items-center"
      >
        <div
          className="bg-white rounded-xl p-6 shadow-xl w-80 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            ยืนยันการลบข้อมูล
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            คุณต้องการลบอาคารนี้หรือไม่?
          </p>
          <div className="flex justify-around">
            <button
              id="btnOk"
              onClick={saveDeleteBuilding}
              className="px-6 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
            >
              ยืนยัน
            </button>
            <button
              id="btnCancel"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteLocationDialog;
