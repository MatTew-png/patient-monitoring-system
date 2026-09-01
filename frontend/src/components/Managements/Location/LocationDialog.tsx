import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";

interface LocationData {
  name: string;
  floorCount: number;
}

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocationData?: LocationData;
  onSubmit: (data: LocationData) => void;
}

const LocationDialog: React.FC<LocationDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialLocationData = { name: "", floorCount: 0 },
}) => {
  const [locationData, setLocationData] =
    useState<LocationData>(initialLocationData);

  useEffect(() => {
    if (isOpen) {
      setLocationData(initialLocationData);
    }
  }, [isOpen]);

  const handleCancel = () => {
    setLocationData({ name: "", floorCount: 0 });
    onClose();
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
          onClick={(e) => e.stopPropagation()} // Prevent dialog close on content click
        >
          {locationData.name ? (
            <h2 className="text-3xl font-semibold text-center mb-6 text-[#2E5361]">
              แก้ไขอาคาร
            </h2>
          ) : (
            <h2 className="text-3xl font-semibold text-center mb-6 text-[#2E5361]">
              เพิ่มอาคาร
            </h2>
          )}

          <div className="mb-4">
            <label className="w-40 text-right mr-4 font-semibold text-gray-700">
              ชื่ออาคาร :
            </label>
            <input
              id="name"
              type="text"
              placeholder="กรุณากรอกชื่ออาคาร"
              value={locationData.name}
              onChange={(e) =>
                setLocationData({ ...locationData, name: e.target.value })
              }
              className="w-112 p-2 border border-gray-300 rounded-md h-10"
            />
          </div>

          <div className="mb-6">
            <label className="w-40 text-right mr-4 font-semibold text-gray-700">
              จำนวนชั้น :
            </label>
            <input
              id="floorCount"
              type="number"
              min={1}
              max={100}
              placeholder="กรุณาระบุจำนวนชั้น"
              value={
                locationData.floorCount === 0 ? "" : locationData.floorCount
              }
              onChange={(e) =>
                setLocationData({
                  ...locationData,
                  floorCount: Number(e.target.value),
                })
              }
              className="w-112 p-2 border border-gray-300 rounded-md h-10"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              id="btnCancel"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
            >
              ยกเลิก
            </button>
            <button
              id="btnSave"
              className="px-6 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] cursor-pointer transform transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
              onClick={() => {
                onSubmit(locationData);
                // onClose();
              }}
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

export default LocationDialog;
