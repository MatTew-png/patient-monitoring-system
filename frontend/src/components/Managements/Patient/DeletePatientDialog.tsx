import React from "react";
import { AnimatePresence, motion } from "framer-motion";

interface DeletePatientDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeletePatientDialog: React.FC<DeletePatientDialogProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
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
            คุณต้องการลบผู้ป่วยคนนี้หรือไม่?
          </p>
          <div className="flex justify-around">
            <button
              id="btnOk"
              onClick={onConfirm}
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

export default DeletePatientDialog;
