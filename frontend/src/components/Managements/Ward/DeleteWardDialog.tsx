import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ward } from "../../../types/ward";
import { useWardStore } from "../../../store/wardStore";

interface DeleteWardDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  initialWardData: Ward;
}

const DeleteWardDialog: React.FC<DeleteWardDialogProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  initialWardData,
}) => {
  const [wardData, setWardData] = useState<Ward>(initialWardData);
  const wardStore = useWardStore();

  useEffect(() => {
    if (isOpen) {
      setWardData(initialWardData);
    }
  }, [isOpen, initialWardData]);

  const handleCancel = () => {
    setWardData({
      ward_id: 0,
      ward_name: "",
      room: [],
    });
    onCancel();
  };
  const handleConfirm = async () => {
    if (initialWardData.ward_id! > 0) {
      await wardStore.deleteWard(initialWardData.ward_id!);
      onConfirm()
      onCancel();
    }
  };

  if (!isOpen) return null;

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
        <div className="bg-white rounded-xl p-6 shadow-xl w-80 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            ยืนยันการลบข้อมูล
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            คุณต้องการลบ "{wardData.ward_name}" หรือไม่?
          </p>
          <div className="flex justify-around">
            <button
              id="btnOk"
              onClick={handleConfirm}
              className="px-6 py-2 bg-[#95BAC3] text-white rounded-xl hover:bg-[#5E8892] cursor-pointer"
            >
              ยืนยัน
            </button>
            <button
              id="btnCancel"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteWardDialog;
